from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status  # ✅ ใช้ตัวนี้จัดการ HTTP Status ทั้งหมด
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView
from django.db.models import Sum
from django.db import transaction  # ✅ สำหรับระบบ Checkout
from django.contrib.auth import get_user_model, authenticate
from rest_framework.authtoken.models import Token
# ✅ รวม Model ทุกตัวไว้ในบรรทัดเดียว (ป้องกัน Error)
from .models import Product, Order, OrderItem, AdminLog, ProductImage, Review 
import logging
import traceback
from django.utils import timezone

User = get_user_model()
logger = logging.getLogger(__name__)
# ==========================================
# 🔧 Admin & Super Admin Core Logic
# ==========================================

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in ['seller', 'admin', 'super_admin']: 
            return Response(status=403)
        
        # 1. Parse Date Filters
        view_mode = request.query_params.get('view_mode', 'daily')
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        
        from django.utils import timezone
        import datetime
        from django.db.models import Count, Sum
        from django.db.models.functions import TruncDate, TruncMonth, TruncYear

        # Default range: Last 30 days if not specified
        today = timezone.now().date()
        
        if start_date_str:
            start_date = datetime.datetime.strptime(start_date_str, "%Y-%m-%d").date()
        else:
            start_date = today - datetime.timedelta(days=30)
            
        if end_date_str:
            end_date = datetime.datetime.strptime(end_date_str, "%Y-%m-%d").date()
        else:
            end_date = today

        # 2. Main Queryset (Filter by Date Range)
        # Include Paid, Processing, Shipped, Completed as "Valid Sales"
        valid_statuses = ['Paid', 'Processing', 'Shipped', 'Completed']
        
        orders_in_range = Order.objects.filter(
            created_at__date__gte=start_date,
            created_at__date__lte=end_date
        )
        
        # 3. Calculate Stats
        sales_agg = orders_in_range.filter(status__in=valid_statuses).aggregate(Sum('total_price'))
        total_sales = sales_agg['total_price__sum'] or 0
        
        print(f"DEBUG: Start={start_date}, End={end_date}")
        print(f"DEBUG: Valid Statuses={valid_statuses}")
        print(f"DEBUG: Orders in Range={orders_in_range.count()}")
        print(f"DEBUG: Paid in Range={orders_in_range.filter(status__in=valid_statuses).count()}")
        print(f"DEBUG: Total Sales Calculated={total_sales}")

        total_orders = orders_in_range.count()
        pending_orders = Order.objects.filter(status='Pending').count() # Pending is usually global/current
        
        # Global Counts (All time)
        global_total_sales = Order.objects.filter(status__in=valid_statuses).aggregate(Sum('total_price'))['total_price__sum'] or 0
        global_total_orders = Order.objects.count()

        # 4. Graph Data
        # Group by Date/Month depending on view_mode
        sales_data = []
        
        if view_mode == 'daily':
            # Generate all dates in range to avoid gaps
            delta = end_date - start_date
            sales_dict = {}
            
            # Query grouped by date
            daily_stats = orders_in_range.filter(status__in=valid_statuses)\
                .annotate(date=TruncDate('created_at'))\
                .values('date')\
                .annotate(sales=Sum('total_price'))\
                .order_by('date')
                
            for stat in daily_stats:
                sales_dict[stat['date']] = stat['sales']
            
            for i in range(delta.days + 1):
                d = start_date + datetime.timedelta(days=i)
                sales_data.append({
                    "name": d.strftime("%d/%m"),
                    "sales": sales_dict.get(d, 0)
                })

        elif view_mode == 'monthly':
            # Logic for monthly grouping (Simplify for now: just daily within the month)
             # ... (reuse daily logic for simplicity or implement TruncMonth)
            delta = end_date - start_date
            sales_dict = {}
            daily_stats = orders_in_range.filter(status__in=valid_statuses)\
                .annotate(date=TruncDate('created_at'))\
                .values('date')\
                .annotate(sales=Sum('total_price'))\
                .order_by('date')
            for stat in daily_stats:
                sales_dict[stat['date']] = stat['sales']
            for i in range(delta.days + 1):
                d = start_date + datetime.timedelta(days=i)
                sales_data.append({
                    "name": d.strftime("%d/%m"),
                    "sales": sales_dict.get(d, 0)
                })
        else: # Yearly (Show sales per month)
             monthly_stats = orders_in_range.filter(status__in=valid_statuses)\
                .annotate(month=TruncMonth('created_at'))\
                .values('month')\
                .annotate(sales=Sum('total_price'))\
                .order_by('month')
             
             sales_map = {m['month'].strftime("%b"): m['sales'] for m in monthly_stats}
             months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
             for m in months:
                 sales_data.append({"name": m, "sales": sales_map.get(m, 0)})

        # 2. Low Stock Products (Stock < 10)
        low_stock_products = Product.objects.filter(stock__lt=10, is_active=True).order_by('stock')[:5]
        low_stock_data = [{
            "id": p.id, 
            "title": p.title, 
            "stock": p.stock, 
            "thumbnail": p.thumbnail.url if p.thumbnail else ""
        } for p in low_stock_products]

        # 5. Pie Chart Data (Sales by Category)
        category_stats = orders_in_range.filter(status__in=valid_statuses)\
            .values('items__product__category')\
            .annotate(value=Sum('items__price_at_purchase'))\
            .order_by('-value')
        
        pie_data = []
        for c in category_stats:
            cat_name = c['items__product__category'] or "Uncategorized"
            pie_data.append({"name": cat_name, "value": c['value']})

        # 6. Bar Chart & Best Sellers (Top 5 Products by Quantity)
        product_stats = orders_in_range.filter(status__in=valid_statuses)\
            .values('items__product__title')\
            .annotate(sales=Sum('items__quantity'))\
            .order_by('-sales')[:5]
            
        bar_data = []
        for p in product_stats:
            p_name = p['items__product__title'] or "Unknown Product"
            bar_data.append({"name": p_name[:15], "sales": p['sales']}) # Truncate name for bar chart

        # 7. Activity Logs (Recent 5)
        recent_logs = AdminLog.objects.all().order_by('-timestamp')[:5]
        logs_data = [{
            "id": l.id,
            "action": l.action,
            "date": l.timestamp.strftime("%d/%m %H:%M"),
            "admin": l.admin.username
        } for l in recent_logs]

        return Response({
            "total_sales": global_total_sales, # Show ALL time sales on cards
            "total_orders": global_total_orders,
            "total_products": Product.objects.count(),
            "total_users": User.objects.count(),
            "pending_orders": pending_orders,
            "low_stock": low_stock_data,
            "sales_data": sales_data,
            "best_sellers": bar_data, # Reuse bar data for simple best seller list if needed
            "pie_data": pie_data,
            "bar_data": bar_data,
            "logs": logs_data
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
def get_all_products_admin_api(request):
    if request.user.role not in ['admin', 'super_admin', 'seller']:
        return Response({"error": "Unauthorized"}, status=403)
    
    # ✅ Fix: Show only Active products (Hide Deleted)
    products = Product.objects.filter(is_active=True).order_by('-id')
    
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
        if 'is_active' in data: 
            # Prevent self-deactivation
            if target_user.id == request.user.id and str(data['is_active']).lower() == 'false':
                 return Response({"error": "ไม่สามารถปิดการใช้งานบัญชีตัวเองได้"}, status=400)
            target_user.is_active = data['is_active']
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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reply_review_api(request, review_id):
    try:
        review = Review.objects.get(id=review_id)
        # Check permission: Admin or Seller
        if not (request.user.role in ['admin', 'super_admin', 'seller']):
             return Response({"error": "Unauthorized"}, status=403)

        review.reply_comment = request.data.get('reply_comment')
        review.reply_timestamp = timezone.now()
        review.save()
        
        # Log action
        if request.user.role != 'seller': # Optional: log for admin
             AdminLog.objects.create(admin=request.user, action=f"Replied to review {review_id}", details=f"Reply: {review.reply_comment[:50]}...")

        return Response({"message": "Reply added", "reply_comment": review.reply_comment, "reply_date": review.reply_timestamp.strftime("%d/%m/%Y %H:%M")})
    except Review.DoesNotExist:
        return Response({"error": "Review not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def product_detail_api(request, product_id):
    print(f"DEBUG: product_detail_api called with id={product_id}")
    try:
        p = Product.objects.get(id=product_id)
        gallery = []
        try:
            gallery = [{"id": img.id, "image": img.image_url.url} for img in p.images.all()] # Used image_url field name
        except Exception as e:
            print(f"Error processing gallery images for product {product_id}: {e}")
            traceback.print_exc()
        
        reviews = []
        try:
            for r in p.reviews.all():
                reviews.append({
                    "id": r.id,
                    "user": r.user.username if r.user else "Anonymous",
                    "rating": r.rating,
                    "comment": r.comment,
                    "date": r.created_at.strftime("%d/%m/%Y") if r.created_at else "",
                    # ✅ Return Reply Data
                    "reply_comment": r.reply_comment,
                    "reply_date": r.reply_timestamp.strftime("%d/%m/%Y %H:%M") if r.reply_timestamp else ""
                })
        except Exception as e:
            print(f"Error processing reviews for product {product_id}: {e}")
            traceback.print_exc()

        data = {
            "id": p.id, "title": p.title, "description": p.description, 
            "category": p.category, "price": p.price, "stock": p.stock, 
            "brand": getattr(p, 'brand', ''), "rating": p.rating,
            "thumbnail": p.thumbnail.url if p.thumbnail else "",
            "images": gallery,
            "reviews": reviews
        }
        return Response(data)
    except Product.DoesNotExist:
        # Debugging: Print all existing IDs to see what's actually in the DB
        all_ids = list(Product.objects.values_list('id', flat=True))
        print(f"DEBUG: Product {product_id} not found. Existing IDs: {all_ids}")
        return Response({"error": f"Not found. Encoded ID: {product_id}. Available: {len(all_ids)} products"}, status=404)
    except Exception as e:
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)

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
    phone = data.get('phone', '') 
    first_name = data.get('first_name', '') # รับชื่อจริง
    last_name = data.get('last_name', '')   # รับนามสกุล
    
    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already exists"}, status=400)

    try:
        # สร้าง User หลัก
        user = User.objects.create_user(username=username, password=password, email=email)
        user.role = 'new_user' 
        user.phone = phone
        user.first_name = first_name # บันทึกชื่อจริง
        user.last_name = last_name   # บันทึกนามสกุล
        
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
            "id": user.id,
            "username": user.username,
            "role": user.role,
            "role_code": user.role,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone": user.phone,
            "address": user.address,
            "avatar": user.image.url if user.image else ""
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

        # Return full user object to update frontend immediately
        return Response({
            "message": "Profile updated successfully",
            "id": user.id,
            "username": user.username,
            "role": user.get_role_display(),
            "role_code": user.role,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone": user.phone,
            "address": user.address,
            "avatar": user.image.url if user.image else ""
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
def get_admin_orders(request):
    if request.user.role not in ['seller', 'admin', 'super_admin']: return Response(status=403)
    orders = Order.objects.all().order_by('-created_at')
    data = [{
        "id": o.id, "customer": o.customer_name, "total_price": o.total_price,
        "status": o.status, "date": o.created_at.strftime("%d/%m/%Y %H:%M"),
        "tel": o.customer_tel, # ✅ Fix: use correct field name 'customer_tel'
        "items": [{
            "product": i.product.title if i.product else "Deleted Product",
            "quantity": i.quantity,
            "price": i.price_at_purchase # ✅ Fix: use correct field name 'price_at_purchase'
        } for i in o.items.all()]
    } for o in orders]
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_order_status_api(request, order_id):
    if request.user.role not in ['seller', 'admin', 'super_admin']: return Response(status=403)
    try:
        order = Order.objects.get(id=order_id)
        order.status = request.data.get('status')
        order.save()
        return Response({"message": "Status updated"})
    except Order.DoesNotExist:
        return Response({"error": "Order not found"}, status=404)


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
        "avatar": u.image.url if u.image else None,
        "is_active": u.is_active,
        "is_superuser": u.is_superuser,
        "is_staff": u.is_staff
    } for u in users]
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_admin_logs(request):
    # Allow admin and super_admin to view logs
    if request.user.role not in ['admin', 'super_admin']: return Response(status=403)
    
    logs = AdminLog.objects.all().order_by('-timestamp')
    data = []
    for l in logs:
        # Simple categorization logic
        category = "General"
        action_lower = l.action.lower()
        if "สินค้า" in action_lower or "product" in action_lower:
            category = "Product"
        elif "ออเดอร์" in action_lower or "order" in action_lower:
            category = "Order"
        elif "ผู้ใช้" in action_lower or "user" in action_lower:
            category = "User"
        elif "login" in action_lower or "logout" in action_lower:
            category = "Auth"
            
        data.append({
            "id": l.id,
            "admin": l.admin.username,
            "action": l.action,
            "category": category,
            "date": l.timestamp.strftime("%d/%m/%Y %H:%M")
        })
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
        # ใช้ transaction เพื่อความปลอดภัยของข้อมูลสต็อก
        with transaction.atomic():
            user = request.user
            data = request.data
            
            cart_items = data.get('items', [])
            customer_info = data.get('customer', {})
            payment_method = data.get('paymentMethod', 'Transfer')

            if not cart_items:
                return Response({"error": "ตะกร้าสินค้าว่างเปล่า"}, status=400)

            total_price = 0
            # 🚩 1. ตรวจสอบข้อมูลและสต็อกสินค้าก่อนสร้างออเดอร์
            for item in cart_items:
                p_id = item.get('id') # ใช้ .get() เพื่อป้องกัน KeyError
                if not p_id:
                    return Response({"error": "ข้อมูลสินค้าไม่สมบูรณ์ (ขาด ID)"}, status=400)
                
                try:
                    product = Product.objects.select_for_update().get(id=p_id)
                    if product.stock < item['quantity']:
                        return Response({"error": f"สินค้า '{product.title}' มีสต็อกไม่พอ"}, status=400)
                    total_price += product.price * item['quantity']
                except Product.DoesNotExist:
                    return Response({"error": f"ไม่พบสินค้า ID: {p_id}"}, status=404)

            # 🚩 2. สร้าง Order
            order = Order.objects.create(
                user=user,
                customer_name=customer_info.get('name', user.username),
                customer_tel=customer_info.get('tel', ''),
                customer_email=customer_info.get('email', user.email),
                shipping_address=customer_info.get('address', ''),
                total_price=total_price,
                payment_method=payment_method,
                status='Pending'
            )

            # 🚩 3. บันทึกรายการสินค้าและตัดสต็อก
            for item in cart_items:
                product = Product.objects.get(id=item['id'])
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=item['quantity'],
                    price_at_purchase=product.price
                )
                # ตัดสต็อกจริง
                product.stock -= item['quantity']
                product.save()

            return Response({
                "message": "สั่งซื้อสำเร็จแล้ว!",
                "order_id": order.id
            }, status=201)

    except Exception as e:
        # พิมพ์ Error ลง Terminal ฝั่ง Backend เพื่อดูสาเหตุเชิงลึก
        import traceback
        print(traceback.format_exc())
        return Response({"error": str(e)}, status=400)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_review(request):
    try:
        user = request.user
        data = request.data
        
        product_id = data.get('product_id')
        rating = data.get('rating')
        comment = data.get('comment')

        # 1. ตรวจสอบข้อมูลเบื้องต้น
        if not product_id or not rating:
            return Response({"error": "กรุณาระบุรหัสสินค้าและคะแนน"}, status=400)

        # 2. ค้นหาสินค้า
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "ไม่พบสินค้าชิ้นนี้"}, status=404)

        # 3. สร้างรีวิว
        Review.objects.create(
            product=product,
            user=user,
            rating=int(rating),
            comment=comment if comment else ""
        )

        # 🚩 (ทางเลือก) อัปเดตคะแนนเฉลี่ยของ Product
        # ถ้าใน Model Product ของคุณมีฟิลด์ rating สามารถคำนวณใหม่ได้ตรงนี้ครับ
        all_reviews = product.reviews.all()
        avg_rating = sum([r.rating for r in all_reviews]) / all_reviews.count()
        product.rating = round(avg_rating, 1)
        product.save()

        return Response({"message": "บันทึกรีวิวเรียบร้อยแล้ว!"}, status=201)

    except Exception as e:
        return Response({"error": str(e)}, status=400)