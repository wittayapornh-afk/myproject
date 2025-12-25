from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.status import HTTP_201_CREATED, HTTP_400_BAD_REQUEST, HTTP_200_OK
from rest_framework.pagination import PageNumberPagination
from django.db.models import Sum
from django.db import transaction
from django.contrib.auth import get_user_model, authenticate
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from .models import Product, Order, OrderItem, AdminLog, ProductImage
import logging
import traceback

User = get_user_model() # Use custom user model

logger = logging.getLogger(__name__)

# ==========================================
# 🔧 Admin & Super Admin Core Logic
# ==========================================

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in ['seller', 'admin', 'super_admin']: 
            return Response(status=403)
        
        total_sales = Order.objects.filter(status='Completed').aggregate(Sum('total_price'))['total_price__sum'] or 0
        return Response({
            "total_sales": total_sales,
            "total_orders": Order.objects.count(),
            "total_products": Product.objects.count(),
            "total_users": User.objects.count()
        })


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
        paginator.page_size = 50
        result_page = paginator.paginate_queryset(products, request)
        
        data = []
        for p in result_page:
            try:
                thumbnail_url = ""
                if p.thumbnail:
                    thumbnail_url = p.thumbnail.url
                
                data.append({
                    "id": p.id,
                    "title": p.title,
                    "category": p.category,
                    "price": p.price,
                    "stock": p.stock,
                    "rating": p.rating,
                    "thumbnail": thumbnail_url,
                })
            except Exception:
                continue
            
        return paginator.get_paginated_response(data)
            
    except Exception as e:
        err_msg = f"Cannot fetch products: {str(e)}\n{traceback.format_exc()}"
        logger.error(err_msg)
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_products_list(request):
    if request.user.role not in ['admin', 'super_admin']:
        return Response({"error": "Unauthorized"}, status=403)
    
    products = Product.objects.all().order_by('-id')
    
    data = [{
        "id": p.id,
        "title": p.title,
        "price": p.price,
        "stock": p.stock,
        "category": p.category,
        "is_active": p.is_active,
        "thumbnail": p.thumbnail.url if p.thumbnail else ""
    } for p in products]
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_products_admin_api(request):
    return admin_products_list(request)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def manage_user_role(request):
    # อนุญาตให้ admin และ super_admin จัดการได้
    if request.user.role not in ['seller', 'admin']:
        return Response({"error": "Unauthorized"}, status=403)
    
    user_id = request.data.get('user_id')
    new_role = request.data.get('new_role') # รับค่า role ใหม่โดยตรง

    try:
        target_user = User.objects.get(id=user_id)
        
        # ป้องกันการเปลี่ยน role ตัวเอง
        if target_user.id == request.user.id:
             return Response({"error": "ไม่สามารถเปลี่ยนสถานะตัวเองได้"}, status=400)

        # ตรวจสอบค่า role ที่ส่งมา
        valid_roles = dict(User.Role.choices).keys()
        if new_role not in valid_roles:
            return Response({"error": "Invalid role"}, status=400)

        # บันทึก Role ใหม่
        target_user.role = new_role
        

        target_user.save()
        
        AdminLog.objects.create(admin=request.user, action=f"Changed role of {target_user.username} to {new_role}")
        
        return Response({"message": f"เปลี่ยนสิทธิ์เป็น {new_role} สำเร็จ"})
        
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user_api(request, user_id):
    # อนุญาตให้ admin และ super_admin ลบผู้ใช้ได้
    if request.user.role not in ['seller', 'admin']:
        return Response({"error": "Unauthorized"}, status=403)

    try:
        target_user = User.objects.get(id=user_id)
        
        # ป้องกันการลบตัวเอง
        if target_user.id == request.user.id:
             return Response({"error": "ไม่สามารถลบบัญชีตัวเองได้"}, status=400)

        # (Optional) ป้องกันการลบ Super Admin อื่น ถ้าเราไม่ใช่ Super Admin (แต่ในที่นี้ถือว่า Admin ร้านจัดการได้หมดถ้าระดับเดียวกัน)
        if target_user.role == 'admin' and request.user.role != 'admin':
             return Response({"error": "ไม่สามารถลบ Admin (Super User เดิม) ได้"}, status=403)

        username = target_user.username
        target_user.delete()
        
        AdminLog.objects.create(admin=request.user, action=f"Deleted user: {username}")
        
        return Response({"message": f"ลบผู้ใช้ {username} สำเร็จ"})
        
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def admin_update_user_api(request, user_id):
    # อนุญาตให้ seller, admin, super_admin
    if request.user.role not in ['seller', 'admin', 'super_admin']:
        return Response({"error": "Unauthorized"}, status=403)

    try:
        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found in DB"}, status=404)
        
        data = request.data

        # 1. ตรวจสอบ Username ซ้ำ (ถ้าเปลี่ยน)
        new_username = data.get('username')
        if new_username and new_username != target_user.username:
            if User.objects.filter(username=new_username).exists():
                return Response({"error": "Username นี้มีผู้ใช้แล้ว"}, status=400)
            target_user.username = new_username

        # 2. ตรวจสอบ Email ซ้ำ (ถ้าเปลี่ยน)
        new_email = data.get('email')
        if new_email and new_email != target_user.email:
            if User.objects.filter(email=new_email).exists():
                return Response({"error": "Email นี้มีผู้ใช้แล้ว"}, status=400)
            target_user.email = new_email

        # 3. อัปเดต Role
        new_role = data.get('role')
        if new_role:
             # ป้องกันการเปลี่ยน role ตัวเอง (ยกเว้น migrate จาก super_admin -> admin)
            if target_user.id == request.user.id and new_role != target_user.role:
                 if not (target_user.role == 'super_admin' and new_role == 'admin'):
                     return Response({"error": "ไม่สามารถเปลี่ยน Role ตัวเองได้ที่นี่"}, status=400)
            
            valid_roles = dict(User.Role.choices).keys()
            if new_role in valid_roles:
                target_user.role = new_role


        # 4. อัปเดตข้อมูลอื่นๆ
        if 'first_name' in data: target_user.first_name = data['first_name']
        if 'last_name' in data: target_user.last_name = data['last_name']
        if 'phone' in data: target_user.phone = data['phone']
        if 'address' in data: target_user.address = data['address']
        if 'avatar' in request.FILES: target_user.image = request.FILES['avatar'] # Fixed field name to image

        target_user.save()

        AdminLog.objects.create(admin=request.user, action=f"Updated user details: {target_user.username}")
        return Response({"message": "อัปเดตข้อมูลผู้ใช้สำเร็จ"})

    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

# ==========================================
# 🛒 Public API (สินค้าหน้าบ้าน)
# ==========================================

@api_view(['GET'])
@permission_classes([AllowAny])
def product_detail_api(request, product_id):
    try:
        p = Product.objects.get(id=product_id)
        gallery = [{"id": img.id, "image": img.image_url.url} for img in p.images.all()] # Used image_url field name
        
        data = {
            "id": p.id, "title": p.title, "description": p.description, 
            "category": p.category, "price": p.price, "stock": p.stock, 
            "brand": getattr(p, 'brand', ''), "rating": p.rating,
            "thumbnail": p.thumbnail.url if p.thumbnail else "",
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
    # รับข้อมูลทั้งหมด
    data = request.data 
    
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')
    phone = data.get('phone', '') # รับเบอร์โทร
    
    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already exists"}, status=400)

    try:
        # สร้าง User หลัก
        user = User.objects.create_user(username=username, password=password, email=email)
        user.role = 'new_user' # Default role updated to new_user
        user.phone = phone
        
        # ถ้ารูปถูกส่งมาด้วย ให้บันทึกลง profile -> user model
        if 'avatar' in request.FILES:
            user.image = request.FILES['avatar']
        
        user.save()
            
        return Response({"message": "Registered successfully"})
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_api(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    if user:
        if not user.is_active:
             return Response({"error": "Account disabled"}, status=403)
             
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            "token": token.key,
            "role": user.role,
            "username": user.username
        })
    return Response({"error": "Invalid credentials"}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_api(request):
    # Token deletion not standard in session auth but if using token auth:
    if hasattr(request.user, 'auth_token'):
        request.user.auth_token.delete()
    return Response({"message": "Logged out"})

@api_view(['GET', 'PUT']) 
@permission_classes([IsAuthenticated])
def user_profile_api(request):
    user = request.user

    # 🟢 กรณีดึงข้อมูล (GET)
    if request.method == 'GET':
        return Response({
            "id": user.id,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone": user.phone,
            "address": user.address, 
            "role": user.get_role_display(),
            "role_code": user.role,
            "avatar": user.image.url if user.image else "" # Use image field
        })
    
    # 🟠 กรณีบันทึกแก้ไข (PUT)
    elif request.method == 'PUT':
        data = request.data

        # 1. อัปเดตข้อมูล User หลัก (username, email)
        if 'username' in data: user.username = data['username']
        if 'email' in data: user.email = data['email']
        if 'first_name' in data: user.first_name = data['first_name']
        if 'last_name' in data: user.last_name = data['last_name']

        # 2. อัปเดตข้อมูล Profile fields (phone, address, image)
        if 'phone' in data: user.phone = data['phone']
        if 'address' in data: user.address = data['address']
        if 'avatar' in request.FILES: user.image = request.FILES['avatar']
        
        user.save()

        return Response({"message": "Profile updated successfully"})

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
                OrderItem.objects.create(order=order, product_id=item['id'], quantity=item['quantity'], price_at_purchase=p.price) # model field is price_at_purchase

        return Response({"message": "Order created", "order_id": order.id}, status=201)
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_orders_api(request):
    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    data = []
    for o in orders:
        try:
            items = []
            for i in o.items.all(): # related_name='items' in OrderItem
                if not i.product: continue
                thumb = i.product.thumbnail.url if i.product.thumbnail else ""
                items.append({"title": i.product.title, "quantity": i.quantity, "price": i.price_at_purchase, "thumbnail": thumb})
            
            date_str = o.created_at.strftime("%d/%m/%Y") if o.created_at else "-"
            data.append({
                "id": o.id, "date": date_str, 
                "total_price": o.total_price, "status": o.status, "items": items
            })
        except Exception as e:
            print(f"Error processing order {o.id}: {e}")
            continue
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_admin_stats(request):
    if request.user.role not in ['seller', 'admin', 'super_admin']: return Response(status=403)
    
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
    if request.user.role not in ['seller', 'admin', 'super_admin']: return Response(status=403)
    orders = Order.objects.all().order_by('-created_at')
    data = [{
        "id": o.id, "customer": o.customer_name, "total_price": o.total_price,
        "status": o.status, "date": o.created_at.strftime("%d/%m/%Y %H:%M")
    } for o in orders]
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_order_status(request, order_id):
    if request.user.role not in ['seller', 'admin', 'super_admin']: return Response(status=403)
    order = Order.objects.get(id=order_id)
    order.status = request.data.get('status')
    order.save()
    return Response({"message": "Status updated"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_orders_api(request):
    return admin_orders_list(request)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_order_status_api(request, order_id):
    return update_order_status(request, order_id)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_users(request):
    # อนุญาตให้ seller และ admin และ super_admin ดูข้อมูลได้
    if request.user.role not in ['seller', 'admin', 'super_admin']: 
        return Response(status=403)
    
    users = User.objects.all()
    data = [{
        "id": u.id, 
        "username": u.username, 
        "first_name": u.first_name,
        "last_name": u.last_name,
        "email": u.email,
        "phone": u.phone if (u.phone and u.phone.lower() != 'null') else "-",
        "address": u.address,
        "role": u.get_role_display(), 
        "role_code": u.role,
        "avatar": u.image.url if u.image else None 
    } for u in users]
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_admin_logs(request):
    if request.user.role != 'super_admin': return Response(status=403)
    logs = AdminLog.objects.all().order_by('-timestamp')
    data = [{"admin": l.admin.username, "action": l.action, "date": l.timestamp.strftime("%d/%m %H:%M")} for l in logs]
    return Response(data)

# ==========================================
# 🔧 Product Management (Add/Edit/Delete)
# ==========================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_product_api(request):
    if request.user.role not in ['admin', 'super_admin']: 
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
            
            # 3. บันทึกรูปแกลเลอรี่ (New Gallery Images)
            new_images = request.FILES.getlist('new_gallery_images')
            for img in new_images:
                ProductImage.objects.create(product=p, image_url=img) # field is image_url in models.py
                
            AdminLog.objects.create(admin=request.user, action=f"เพิ่มสินค้า: {p.title}")
            return Response({"message": "Added", "id": p.id}, status=201)
            
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def edit_product_api(request, product_id):
    if request.user.role not in ['admin', 'super_admin']: return Response(status=403)
    
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
        ProductImage.objects.create(product=p, image_url=img)
        
    delete_ids = request.data.getlist('delete_image_ids')
    if delete_ids:
        ProductImage.objects.filter(id__in=delete_ids, product=p).delete()

    AdminLog.objects.create(admin=request.user, action=f"แก้ไขสินค้า: {p.title}")
    return Response({"message": "Updated"})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_product_api(request, product_id):
    if request.user.role not in ['admin', 'super_admin']: return Response(status=403)
    
    p = Product.objects.get(id=product_id)
    p.is_active = False 
    p.save()
    
    AdminLog.objects.create(admin=request.user, action=f"ลบสินค้า: {p.title}")
    return Response({"message": "Deleted"})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_product_image_api(request, image_id):
    if request.user.role not in ['admin', 'super_admin']: return Response(status=403)
    try:
        img = ProductImage.objects.get(id=image_id)
        product = img.product
        img.delete()
        AdminLog.objects.create(admin=request.user, action=f"Deleted image from product: {product.title}")
        return Response({"message": "Image deleted"})
    except ProductImage.DoesNotExist:
        return Response({"error": "Image not found"}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def checkout_api(request):
    try:
        # ใช้ transaction เพื่อถ้าตัดของไม่ได้ ให้ยกเลิกออเดอร์ทั้งหมด (กันข้อมูลพัง)
        with transaction.atomic():
            user = request.user
            data = request.data
            cart_items = data.get('items', [])
            customer_info = data.get('customer', {})

            if not cart_items:
                return Response({"error": "ตะกร้าสินค้าว่างเปล่า"}, status=400)

            # 1. ตรวจสอบสต็อกสินค้าก่อน (ว่ามีของพอไหม)
            total_price = 0
            for item in cart_items:
                product = Product.objects.select_for_update().get(id=item['id'])
                if product.stock < item['quantity']:
                    # ❌ ถ้าของหมด ให้แจ้ง Error กลับไปทันที
                    raise Exception(f"สินค้า '{product.title}' มีไม่เพียงพอ (เหลือ {product.stock})")
                total_price += product.price * item['quantity']

            # 2. สร้าง Order (บันทึกว่าใครซื้อ)
            order = Order.objects.create(
                user=user,  # ✅ ผูกกับ User ที่ Login
                customer_name=customer_info.get('name', user.username),
                customer_tel=customer_info.get('tel', ''),
                customer_email=customer_info.get('email', user.email),
                shipping_address=customer_info.get('address', ''), # field is shipping_address
                total_price=total_price, # ใช้ราคาที่คำนวณใหม่จาก Backend เพื่อความชัวร์
                payment_method=data.get('paymentMethod', 'Transfer'),
                status='Pending'
            )

            # 3. สร้าง OrderItem และ ✅ ตัดสต็อกสินค้า
            for item in cart_items:
                product = Product.objects.get(id=item['id'])
                
                # บันทึกรายการลงออเดอร์
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=item['quantity'],
                    price_at_purchase=product.price
                )
                
                # ✂️ ตัดสต็อกตรงนี้
                product.stock -= item['quantity']
                product.save()

            return Response({"message": "สั่งซื้อสำเร็จ!", "order_id": order.id})

    except Product.DoesNotExist:
        return Response({"error": "ไม่พบสินค้าในระบบ"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=400)