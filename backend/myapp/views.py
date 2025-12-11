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
        products = Product.objects.filter(is_active=True).order_by('-id') # ✅ เลือกเฉพาะสินค้าที่ Active
        
        # ... (โค้ดเดิมส่วน filter เหมือนเดิม) ...
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
        source = result_page if result_page is not None else products
        
        data = []
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

        # ... (ส่วน reviews และ related products เหมือนเดิม) ...
        # (ขอละไว้เพื่อความกระชับ แต่โค้ดเดิมใช้ได้)
        
        reviews = p.reviews.all().order_by('-created_at')
        reviews_data = [{
            "id": r.id,
            "user": r.user.username if r.user else "Anonymous",
            "rating": r.rating,
            "comment": r.comment,
            "date": r.created_at.strftime("%d/%m/%Y")
        } for r in reviews]

        next_p = Product.objects.filter(id__gt=p.id, is_active=True).order_by('id').first()
        prev_p = Product.objects.filter(id__lt=p.id, is_active=True).order_by('-id').first()
        
        related_products = Product.objects.filter(category=p.category, is_active=True).exclude(id=p.id).order_by('?')[:4]
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
# 📝 Auth & Profile (ปรับปรุงใหม่)
# ==========================================

@api_view(['POST'])
@permission_classes([AllowAny])
def register_api(request):
    try:
        data = request.data
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')
        
        # Validation
        if not username or not password or not email:
            return Response({"error": "กรุณากรอกข้อมูลให้ครบถ้วน"}, status=HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(username=username).exists():
            return Response({"error": "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว"}, status=HTTP_400_BAD_REQUEST)
            
        if User.objects.filter(email=email).exists():
            return Response({"error": "อีเมลนี้ถูกใช้งานแล้ว"}, status=HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            user = User.objects.create_user(username=username, password=password, email=email)
            profile = UserProfile.objects.create(user=user, role='user')

            if 'avatar' in request.FILES:
                profile.avatar = request.FILES['avatar']
                profile.save()

        return Response({"message": "สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ"}, status=HTTP_201_CREATED)
    except Exception as e:
        logger.error(f"Register Error: {e}")
        return Response({"error": "เกิดข้อผิดพลาดภายในระบบ"}, status=HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_api(request):
    # ลบ Token ของ User เพื่อให้ Logout สมบูรณ์แบบ
    try:
        request.user.auth_token.delete()
        return Response({"message": "ออกจากระบบสำเร็จ"}, status=HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_profile_api(request):
    user = request.user
    # ป้องกัน error หาก user ไม่มี profile (สร้างให้เลยถ้าไม่มี)
    profile, created = UserProfile.objects.get_or_create(user=user)

    if request.method == 'GET':
        avatar_url = request.build_absolute_uri(profile.avatar.url) if profile.avatar else ""
        return Response({
            "id": user.id, "username": user.username, "role": profile.get_role_display(),
            "role_code": profile.role, "email": user.email,
            "phone": profile.phone, "address": profile.address, "avatar": avatar_url
        })
    elif request.method == 'PUT':
        data = request.data
        if 'email' in data: user.email = data['email']
        user.save()
        
        if 'phone' in data: profile.phone = data['phone']
        if 'address' in data: profile.address = data['address']
        if 'avatar' in request.FILES: profile.avatar = request.FILES['avatar']
        profile.save()
        return Response({"message": "อัปเดตข้อมูลสำเร็จ"})

# ==========================================
# 📦 Order & Admin
# ==========================================

@api_view(['GET'])
@permission_classes([AllowAny])
def categories_api(request):
    categories = Product.objects.filter(is_active=True).values_list('category', flat=True).distinct()
    return Response({"categories": ["ทั้งหมด"] + list(categories)})

# ==========================================
# 📦 Order & Admin (ปรับปรุง Logic ตัดสต็อก)
# ==========================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    try:
        user = request.user
        data = request.data
        cart_items = data.get('cart_items', [])
        customer_info = data.get('customer_info', {})

        if not cart_items:
            return Response({"error": "ตะกร้าว่างเปล่า"}, status=HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            total_price = 0
            
            # 1. ตรวจสอบสินค้าและคำนวณราคาก่อน
            for item in cart_items:
                try:
                    # select_for_update ล็อกแถวข้อมูลไว้กันคนอื่นแย่งซื้อพร้อมกัน
                    product = Product.objects.select_for_update().get(id=item['id'], is_active=True)
                except Product.DoesNotExist:
                    raise ValueError(f"สินค้า ID {item['id']} ไม่พบในระบบหรือถูกลบไปแล้ว")

                if product.stock < item['quantity']:
                    raise ValueError(f"สินค้า '{product.title}' คงเหลือไม่พอ (เหลือ {product.stock})")
                
                total_price += product.price * item['quantity']

            # 2. สร้าง Order
            order = Order.objects.create(
                user=user,
                customer_name=customer_info.get('name', user.username),
                customer_tel=customer_info.get('tel', '-'),
                address=customer_info.get('address', '-'),
                total_price=total_price,
                status='Pending'
            )

            # 3. ตัดสต็อกและสร้าง OrderItem
            for item in cart_items:
                product = Product.objects.get(id=item['id'])
                OrderItem.objects.create(
                    order=order, 
                    product=product, 
                    quantity=item['quantity'], 
                    price=product.price
                )
                product.stock -= item['quantity']
                product.save()

            # 4. อัปเดต Role ผู้ใช้
            profile, created = UserProfile.objects.get_or_create(user=user)
            if profile.role == 'user':
                profile.role = 'customer'
                profile.save()

        return Response({"message": "สั่งซื้อสำเร็จ", "order_id": order.id}, status=HTTP_201_CREATED)
        
    except ValueError as e:
        return Response({"error": str(e)}, status=HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Order Error: {e}")
        return Response({"error": "เกิดข้อผิดพลาดในการสั่งซื้อ กรุณาลองใหม่"}, status=500)

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
    # ตรวจสอบสิทธิ์ (เฉพาะ Admin)
    if request.user.profile.role not in ['admin', 'super_admin']:
        return Response({"error": "Unauthorized"}, status=403)

    try:
        product = Product.objects.get(id=product_id)
        data = request.data

        # อัปเดตข้อมูล (ใช้ get เพื่อป้องกัน error ถ้าค่าไม่ถูกส่งมา)
        product.title = data.get('title', product.title)
        product.description = data.get('description', product.description)
        product.category = data.get('category', product.category)
        product.price = data.get('price', product.price)
        product.stock = data.get('stock', product.stock)
        product.brand = data.get('brand', product.brand)
        
        # อัปเดตตูปภาพเฉพาะเมื่อมีการส่งไฟล์มาใหม่
        if 'thumbnail' in request.FILES:
            product.thumbnail = request.FILES['thumbnail']
        
        product.save()

        # บันทึก Log
        AdminLog.objects.create(
            admin=request.user,
            action=f"แก้ไขสินค้า: {product.title} (ID: {product.id})"
        )

        return Response({"message": "แก้ไขสินค้าสำเร็จ", "id": product.id})

    except Product.DoesNotExist:
        return Response({"error": "ไม่พบสินค้า"}, status=404)
    except Exception as e:
        print(f"Error editing product: {str(e)}") # Print error ใน Terminal เพื่อ Debug
        return Response({"error": str(e)}, status=500)
    
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_product_api(request, product_id):
    if request.user.profile.role not in ['admin', 'super_admin']:
        return Response({"error": "Unauthorized"}, status=403)

    try:
        product = Product.objects.get(id=product_id)
        product.delete()  # ✅ คำสั่งนี้จะลบออกจาก Database ถาวร
        return Response({"message": "ลบสินค้าเรียบร้อยแล้ว"})
    except Product.DoesNotExist:
        return Response({"error": "ไม่พบสินค้า"}, status=404)

    try:
        product = Product.objects.get(id=product_id)
        
        # Soft Delete: แค่ปิดการใช้งาน ไม่ลบข้อมูลจริง เพื่อรักษาประวัติการสั่งซื้อ
        product.is_active = False 
        product.save()

        AdminLog.objects.create(
            admin=request.user,
            action=f"ลบสินค้า (Soft Delete): {product.title} (ID: {product.id})"
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