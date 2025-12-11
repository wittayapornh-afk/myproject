from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.status import HTTP_201_CREATED, HTTP_400_BAD_REQUEST
from rest_framework.pagination import PageNumberPagination
from django.db.models import Sum
from django.db import transaction  # ✅ 1. ใส่ตัวนี้แก้ error transaction
from django.utils import timezone
from django.contrib.auth.models import User
from datetime import timedelta
from .models import Product, Order, OrderItem, UserProfile, AdminLog
import logging

logger = logging.getLogger(__name__)

# ==========================================
# 🛒 Public API
# ==========================================

@api_view(['GET'])
@permission_classes([AllowAny])
def products_api(request):
    try:
        products = Product.objects.all().order_by('-id')
        category = request.query_params.get('category')
        search = request.query_params.get('search')
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        sort = request.query_params.get('sort')

        if category and category != "ทั้งหมด":
            products = products.filter(category=category)
        if search:
            products = products.filter(title__icontains=search)
        if min_price:
            products = products.filter(price__gte=min_price)
        if max_price:
            products = products.filter(price__lte=max_price)

        if sort == 'price_asc':
            products = products.order_by('price')
        elif sort == 'price_desc':
            products = products.order_by('-price')

        paginator = PageNumberPagination()
        paginator.page_size = 12
        result_page = paginator.paginate_queryset(products, request)

        data = []
        source = result_page if result_page is not None else products
        
        for p in source:
            data.append({
                "id": p.id,
                "title": p.title,
                "category": p.category,
                "price": p.price,
                "stock": p.stock,
                "description": p.description,
                "rating": p.rating,
                "thumbnail": request.build_absolute_uri(p.thumbnail.url) if p.thumbnail else "",
            })
            
        return paginator.get_paginated_response(data)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def product_detail_api(request, product_id):
    try:
        p = Product.objects.get(id=product_id)
        gallery_images = [request.build_absolute_uri(img.image.url) for img in p.images.all()]
        thumbnail_url = request.build_absolute_uri(p.thumbnail.url) if p.thumbnail else ""

        reviews = p.reviews.all().order_by('-created_at')
        reviews_data = [{
            "id": r.id,
            "user": r.user.username if r.user else "Anonymous",
            "rating": r.rating,
            "comment": r.comment,
            "date": r.created_at.strftime("%d/%m/%Y")
        } for r in reviews]

        next_p = Product.objects.filter(id__gt=p.id).order_by('id').first()
        prev_p = Product.objects.filter(id__lt=p.id).order_by('-id').first()
        related_products = Product.objects.filter(category=p.category).exclude(id=p.id).order_by('?')[:4]
        
        related_data = [{
            "id": rp.id, "title": rp.title, "price": rp.price, "rating": rp.rating,
            "category": rp.category, "thumbnail": request.build_absolute_uri(rp.thumbnail.url) if rp.thumbnail else ""
        } for rp in related_products]

        data = {
            "id": p.id, "title": p.title, "description": p.description, "category": p.category,
            "price": p.price, "stock": p.stock, "brand": getattr(p, 'brand', ''), "rating": p.rating,
            "thumbnail": thumbnail_url, "images": gallery_images, "reviews": reviews_data,
            "next_product": next_p.id if next_p else None, "prev_product": prev_p.id if prev_p else None,
            "related_products": related_data
        }
        return Response(data)
    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=404)

@api_view(['GET'])
@permission_classes([AllowAny])
def categories_api(request):
    categories = Product.objects.values_list('category', flat=True).distinct()
    return Response({"categories": ["ทั้งหมด"] + list(categories)})

# ==========================================
# 📝 Auth & Profile
# ==========================================

@api_view(['POST'])
@permission_classes([AllowAny])
def register_api(request):
    try:
        data = request.data
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')
        
        if not username or not password:
            return Response({"error": "กรุณากรอกข้อมูลให้ครบ"}, status=400)
        if User.objects.filter(username=username).exists():
            return Response({"error": "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว"}, status=400)

        user = User.objects.create_user(username=username, password=password, email=email)
        profile = UserProfile.objects.create(user=user, role='user')

        if 'avatar' in request.FILES:
            profile.avatar = request.FILES['avatar']
            profile.save()

        return Response({"message": "สมัครสำเร็จ"}, status=201)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_profile_api(request):
    user = request.user
    if not hasattr(user, 'profile'):
        UserProfile.objects.create(user=user)

    if request.method == 'GET':
        avatar_url = request.build_absolute_uri(user.profile.avatar.url) if user.profile.avatar else ""
        return Response({
            "id": user.id, "username": user.username, "role": user.profile.get_role_display(),
            "role_code": user.profile.role, "email": user.email,
            "phone": user.profile.phone, "address": user.profile.address, "avatar": avatar_url
        })
    elif request.method == 'PUT':
        data = request.data
        if 'email' in data: user.email = data['email']
        user.save()
        if 'phone' in data: user.profile.phone = data['phone']
        if 'address' in data: user.profile.address = data['address']
        if 'avatar' in request.FILES: user.profile.avatar = request.FILES['avatar']
        user.profile.save()
        return Response({"message": "Profile updated"})

# ==========================================
# 📦 Order & Admin
# ==========================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    try:
        user = request.user # ✅ 2. ประกาศตัวแปร user (แก้ error user not defined)
        data = request.data
        cart_items = data.get('cart_items', [])
        customer_info = data.get('customer_info', {})

        if not cart_items:
            return Response({"error": "ตะกร้าว่าง"}, status=HTTP_400_BAD_REQUEST)

        with transaction.atomic(): # ✅ ใช้ transaction
            total_price = 0
            for item in cart_items:
                product = Product.objects.select_for_update().get(id=item['id'])
                if product.stock < item['quantity']:
                    raise ValueError(f"สินค้า '{product.title}' มีของไม่พอ")
                total_price += product.price * item['quantity']

            order = Order.objects.create(
                user=user,
                customer_name=customer_info.get('name', user.username),
                customer_tel=customer_info.get('tel', '-'),
                address=customer_info.get('address', '-'),
                total_price=total_price,
                status='Pending'
            )

            for item in cart_items:
                product = Product.objects.get(id=item['id'])
                OrderItem.objects.create(order=order, product=product, quantity=item['quantity'], price=product.price)
                product.stock -= item['quantity']
                product.save()

            if hasattr(user, 'profile') and user.profile.role == 'user':
                user.profile.role = 'customer'
                user.profile.save()

        return Response({"message": "สั่งซื้อสำเร็จ", "order_id": order.id}, status=HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_orders_api(request):
    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    data = []
    for o in orders:
        items = [{"title": i.product.title, "quantity": i.quantity, "price": i.price, "thumbnail": request.build_absolute_uri(i.product.thumbnail.url) if i.product.thumbnail else ""} for i in o.items.all()]
        data.append({"id": o.id, "date": o.created_at.strftime("%d/%m/%Y"), "total_price": o.total_price, "status": o.status, "items": items})
    return Response(data)

@api_view(['POST'])
@permission_classes([AllowAny])
def update_order_status(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
        order.status = request.data.get('status')
        order.save()
        return Response({"message": "Status updated"})
    except Order.DoesNotExist:
        return Response({"error": "Order not found"}, status=404)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_admin_stats(request):
    total_sales = Order.objects.filter(status='Delivered').aggregate(Sum('total_price'))['total_price__sum'] or 0
    total_orders = Order.objects.count()
    total_products = Product.objects.count()
    total_users = UserProfile.objects.filter(role__in=['user', 'customer']).count()
    
    recent_orders = Order.objects.all().order_by('-created_at')[:5].values('id', 'customer_name', 'total_price', 'status', 'created_at')
    
    return Response({
        "total_sales": total_sales, "total_orders": total_orders, "total_products": total_products,
        "total_users": total_users, "recent_orders": recent_orders,
        "graph_sales": [], "graph_category": [], "low_stock_products": []
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_users(request):
    if request.user.profile.role != 'super_admin':
        return Response({"error": "Unauthorized"}, status=403)
    users = UserProfile.objects.all().select_related('user')
    data = [{"id": u.user.id, "username": u.user.username, "email": u.user.email, "role": u.get_role_display(), "role_code": u.role, "date_joined": u.created_at.strftime("%d/%m/%Y")} for u in users]
    return Response(data)

# ==========================================
# 🔧 Admin Product Management (จัดการสินค้า)
# ==========================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_product_api(request):
    # เช็คสิทธิ์: ต้องเป็น admin หรือ super_admin เท่านั้น
    if request.user.profile.role not in ['admin', 'super_admin']:
        return Response({"error": "Unauthorized"}, status=403)

    try:
        data = request.data
        product = Product.objects.create(
            title=data.get('title'),
            description=data.get('description', ''),
            category=data.get('category'),
            price=data.get('price'),
            stock=data.get('stock', 0),
            brand=data.get('brand', ''),
        )
        
        if 'thumbnail' in request.FILES:
            product.thumbnail = request.FILES['thumbnail']
            product.save()

        # ✅ บันทึก Log
        AdminLog.objects.create(
            admin=request.user,
            action=f"เพิ่มสินค้า: {product.title} (ID: {product.id})"
        )

        return Response({"message": "เพิ่มสินค้าสำเร็จ", "id": product.id}, status=201)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def edit_product_api(request, product_id):
    if request.user.profile.role not in ['admin', 'super_admin']:
        return Response({"error": "Unauthorized"}, status=403)

    try:
        product = Product.objects.get(id=product_id)
        data = request.data

        # อัปเดตข้อมูล (ถ้าส่งมา)
        if 'title' in data: product.title = data['title']
        if 'description' in data: product.description = data['description']
        if 'category' in data: product.category = data['category']
        if 'price' in data: product.price = data['price']
        if 'stock' in data: product.stock = data['stock']
        if 'brand' in data: product.brand = data['brand']
        if 'is_active' in data: product.is_active = (data['is_active'] == 'true' or data['is_active'] == True)
        
        if 'thumbnail' in request.FILES:
            product.thumbnail = request.FILES['thumbnail']
        
        product.save()

        # ✅ บันทึก Log
        AdminLog.objects.create(
            admin=request.user,
            action=f"แก้ไขสินค้า: {product.title} (ID: {product.id})"
        )

        return Response({"message": "แก้ไขสินค้าสำเร็จ"})
    except Product.DoesNotExist:
        return Response({"error": "ไม่พบสินค้า"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_product_api(request, product_id):
    if request.user.profile.role not in ['admin', 'super_admin']:
        return Response({"error": "Unauthorized"}, status=403)

    try:
        product = Product.objects.get(id=product_id)
        product_title = product.title
        product_id_log = product.id
        
        product.delete() # หรือใช้ product.is_active = False ถ้าไม่อยากลบจริง

        # ✅ บันทึก Log
        AdminLog.objects.create(
            admin=request.user,
            action=f"ลบสินค้า: {product_title} (ID: {product_id_log})"
        )

        return Response({"message": "ลบสินค้าสำเร็จ"})
    except Product.DoesNotExist:
        return Response({"error": "ไม่พบสินค้า"}, status=404)

# ==========================================
# 🛡️ Super Admin Logs (ดูประวัติการทำงาน)
# ==========================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_admin_logs(request):
    # เฉพาะ Super Admin เท่านั้นที่ดู Log ได้
    if request.user.profile.role != 'super_admin':
        return Response({"error": "Unauthorized: Super Admin only"}, status=403)

    logs = AdminLog.objects.all().order_by('-timestamp')
    data = [{
        "id": log.id,
        "admin": log.admin.username,
        "role": log.admin.profile.get_role_display(),
        "action": log.action,
        "date": log.timestamp.strftime("%d/%m/%Y %H:%M")
    } for log in logs]

    return Response(data)