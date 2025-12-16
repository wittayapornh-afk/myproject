from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.status import HTTP_201_CREATED, HTTP_400_BAD_REQUEST, HTTP_200_OK
from rest_framework.pagination import PageNumberPagination
from django.db.models import Sum
from django.db import transaction
from django.contrib.auth.models import User
from .models import Product, Order, OrderItem, UserProfile, AdminLog, ProductImage
import logging

logger = logging.getLogger(__name__)

# ==========================================
# 🔧 Admin & Super Admin Core Logic
# ==========================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_products_list(request):
    if request.user.profile.role not in ['admin', 'super_admin']:
        return Response({"error": "Unauthorized"}, status=403)
    
    products = Product.objects.all().order_by('-id')
    
    data = [{
        "id": p.id,
        "title": p.title,
        "price": p.price,
        "stock": p.stock,
        "category": p.category,
        "is_active": p.is_active,
        "thumbnail": request.build_absolute_uri(p.thumbnail.url) if p.thumbnail else ""
    } for p in products]
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def manage_user_role(request):
    if request.user.profile.role != 'super_admin':
        return Response({"error": "Unauthorized: Super Admin only"}, status=403)
    
    user_id = request.data.get('user_id')
    action = request.data.get('action') 

    try:
        target_user = User.objects.get(id=user_id)
        profile = target_user.profile
        
        if target_user.id == request.user.id:
             return Response({"error": "ไม่สามารถเปลี่ยนสถานะตัวเองได้"}, status=400)

        if action == 'promote':
            profile.role = 'admin'
            target_user.is_staff = True
            msg = "แต่งตั้งเป็น Admin"
        elif action == 'demote':
            profile.role = 'user'
            target_user.is_staff = False
            msg = "ปลดเป็น User"
        else:
            return Response({"error": "Invalid action"}, status=400)

        target_user.save()
        profile.save()
        
        AdminLog.objects.create(admin=request.user, action=f"{msg}: {target_user.username}")
        
        return Response({"message": f"ดำเนินการ {msg} สำเร็จ"})
        
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

# ==========================================
# 🛒 Public API (สินค้าหน้าบ้าน)
# ==========================================

@api_view(['GET'])
@permission_classes([AllowAny])
def products_api(request):
    try:
        products = Product.objects.filter(is_active=True).order_by('-id')
        category = request.query_params.get('category')
        search = request.query_params.get('search')
        
        if category and category != "ทั้งหมด":
            products = products.filter(category=category)
        if search:
            products = products.filter(title__icontains=search)

        paginator = PageNumberPagination()
        paginator.page_size = 12
        result_page = paginator.paginate_queryset(products, request)
        
        data = [{
            "id": p.id,
            "title": p.title,
            "category": p.category,
            "price": p.price,
            "stock": p.stock,
            "rating": p.rating,
            "thumbnail": request.build_absolute_uri(p.thumbnail.url) if p.thumbnail else "",
        } for p in result_page]
            
        return paginator.get_paginated_response(data)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def product_detail_api(request, product_id):
    try:
        p = Product.objects.get(id=product_id)
        gallery = [{"id": img.id, "image": request.build_absolute_uri(img.image.url)} for img in p.images.all()]
        
        data = {
            "id": p.id, "title": p.title, "description": p.description, 
            "category": p.category, "price": p.price, "stock": p.stock, 
            "brand": getattr(p, 'brand', ''), "rating": p.rating,
            "thumbnail": request.build_absolute_uri(p.thumbnail.url) if p.thumbnail else "",
            "images": gallery
        }
        return Response(data)
    except Product.DoesNotExist:
        return Response({"error": "Not found"}, status=404)

@api_view(['GET'])
@permission_classes([AllowAny])
def categories_api(request):
    categories = Product.objects.filter(is_active=True).values_list('category', flat=True).distinct()
    return Response({"categories": ["ทั้งหมด"] + list(categories)})

# ==========================================
# 📝 Auth & Profile
# ==========================================

@api_view(['POST'])
@permission_classes([AllowAny])
def register_api(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')
    
    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already exists"}, status=400)

    user = User.objects.create_user(username=username, password=password, email=email)
    UserProfile.objects.create(user=user, role='user')
    return Response({"message": "Registered successfully"})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_api(request):
    request.user.auth_token.delete()
    return Response({"message": "Logged out"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile_api(request):
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    return Response({
        "id": request.user.id,
        "username": request.user.username,
        "role": profile.get_role_display(),
        "role_code": profile.role,
        "avatar": request.build_absolute_uri(profile.avatar.url) if profile.avatar else ""
    })

# ==========================================
# 📦 Order & Stats
# ==========================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    cart_items = request.data.get('cart_items', [])
    if not cart_items: return Response({"error": "Empty cart"}, status=400)

    try:
        with transaction.atomic():
            total_price = 0
            for item in cart_items:
                p = Product.objects.select_for_update().get(id=item['id'])
                if p.stock < item['quantity']: raise ValueError(f"{p.title} out of stock")
                total_price += p.price * item['quantity']
                p.stock -= item['quantity']
                p.save()

            order = Order.objects.create(
                user=request.user,
                customer_name=request.user.username,
                total_price=total_price,
                status='Pending'
            )
            
            for item in cart_items:
                OrderItem.objects.create(order=order, product_id=item['id'], quantity=item['quantity'], price=item['price'])

        return Response({"message": "Order created", "order_id": order.id}, status=201)
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_orders_api(request):
    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    data = []
    for o in orders:
        items = [{"title": i.product.title, "quantity": i.quantity, "price": i.price, "thumbnail": request.build_absolute_uri(i.product.thumbnail.url) if i.product.thumbnail else ""} for i in o.items.all()]
        data.append({
            "id": o.id, "date": o.created_at.strftime("%d/%m/%Y"), 
            "total_price": o.total_price, "status": o.status, "items": items
        })
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_admin_stats(request):
    if request.user.profile.role not in ['admin', 'super_admin']: return Response(status=403)
    
    total_sales = Order.objects.filter(status='Completed').aggregate(Sum('total_price'))['total_price__sum'] or 0
    return Response({
        "total_sales": total_sales,
        "total_orders": Order.objects.count(),
        "total_products": Product.objects.count(),
        "total_users": User.objects.count()
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_orders_list(request):
    if request.user.profile.role not in ['admin', 'super_admin']: return Response(status=403)
    orders = Order.objects.all().order_by('-created_at')
    data = [{
        "id": o.id, "customer": o.customer_name, "total_price": o.total_price,
        "status": o.status, "date": o.created_at.strftime("%d/%m/%Y %H:%M")
    } for o in orders]
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_order_status(request, order_id):
    if request.user.profile.role not in ['admin', 'super_admin']: return Response(status=403)
    order = Order.objects.get(id=order_id)
    order.status = request.data.get('status')
    order.save()
    return Response({"message": "Status updated"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_users(request):
    if request.user.profile.role != 'super_admin': return Response(status=403)
    users = UserProfile.objects.all().select_related('user')
    data = [{
        "id": u.user.id, "username": u.user.username, "email": u.user.email,
        "role": u.get_role_display(), "role_code": u.role
    } for u in users]
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_admin_logs(request):
    if request.user.profile.role != 'super_admin': return Response(status=403)
    logs = AdminLog.objects.all().order_by('-timestamp')
    data = [{"admin": l.admin.username, "action": l.action, "date": l.timestamp.strftime("%d/%m %H:%M")} for l in logs]
    return Response(data)

# ==========================================
# 🔧 Product Management (Add/Edit/Delete)
# ==========================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_product_api(request):
    if request.user.profile.role not in ['admin', 'super_admin']: 
        return Response(status=403)
    
    data = request.data
    try:
        with transaction.atomic(): # ใช้ transaction เพื่อความปลอดภัย (ถ้าพังให้ rollback)
            # 1. สร้างตัวสินค้า
            p = Product.objects.create(
                title=data['title'], 
                description=data.get('description',''), 
                price=data['price'], 
                stock=data['stock'], 
                category=data['category'], 
                brand=data.get('brand','')
            )
            
            # 2. บันทึกรูปหลัก (Thumbnail)
            if 'thumbnail' in request.FILES:
                p.thumbnail = request.FILES['thumbnail']
                p.save()
            
            # 3. บันทึกรูปแกลเลอรี่ (New Gallery Images) ✅ เพิ่มส่วนนี้
            new_images = request.FILES.getlist('new_gallery_images')
            for img in new_images:
                ProductImage.objects.create(product=p, image=img)
                
            AdminLog.objects.create(admin=request.user, action=f"เพิ่มสินค้า: {p.title}")
            return Response({"message": "Added", "id": p.id}, status=201)
            
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def edit_product_api(request, product_id):
    if request.user.profile.role not in ['admin', 'super_admin']: return Response(status=403)
    
    p = Product.objects.get(id=product_id)
    data = request.data
    p.title = data.get('title', p.title)
    p.description = data.get('description', p.description)
    p.price = data.get('price', p.price)
    p.stock = data.get('stock', p.stock)
    p.category = data.get('category', p.category)
    p.brand = data.get('brand', p.brand)
    
    if 'thumbnail' in request.FILES:
        p.thumbnail = request.FILES['thumbnail']
    p.save()
    
    new_images = request.FILES.getlist('new_gallery_images')
    for img in new_images:
        ProductImage.objects.create(product=p, image=img)
        
    delete_ids = request.data.getlist('delete_image_ids')
    if delete_ids:
        ProductImage.objects.filter(id__in=delete_ids, product=p).delete()

    AdminLog.objects.create(admin=request.user, action=f"แก้ไขสินค้า: {p.title}")
    return Response({"message": "Updated"})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_product_api(request, product_id):
    if request.user.profile.role not in ['admin', 'super_admin']: return Response(status=403)
    
    p = Product.objects.get(id=product_id)
    p.is_active = False 
    p.save()
    
    AdminLog.objects.create(admin=request.user, action=f"ลบสินค้า: {p.title}")
    return Response({"message": "Deleted"})