from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status  # ✅ ใช้ตัวนี้จัดการ HTTP Status ทั้งหมด
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView
from django.db.models import Sum, Q, Count
from django.db import transaction  # ✅ สำหรับระบบ Checkout
from django.contrib.auth import get_user_model, authenticate
from rest_framework.authtoken.models import Token
# ✅ รวม Model ทุกตัวไว้ในบรรทัดเดียว (ป้องกัน Error)
from .models import Product, Order, OrderItem, AdminLog, ProductImage, Review, StockHistory 
import logging
import traceback
from django.utils import timezone
import csv
from django.http import HttpResponse
from datetime import timedelta, datetime
import calendar

User = get_user_model()
logger = logging.getLogger(__name__)

User = get_user_model()
logger = logging.getLogger(__name__)

# ✅ PromptPay Helper Functions (Native Implementation to avoid Lib Error)
import binascii

def crc16(data: str) -> str:
    crc = 0xFFFF
    for char in data:
        crc ^= ord(char) << 8
        for _ in range(8):
            if (crc & 0x8000):
                crc = (crc << 1) ^ 0x1021
            else:
                crc <<= 1
        crc &= 0xFFFF
    return hex(crc)[2:].upper().zfill(4)

def generate_promptpay_payload(amount):
    """
    Generate PromptPay QR payload (EMVCo) for a specific amount.
    Target ID: 098-765-4321 (Mock ID) -> 0066987654321
    """
    # 1. Payload Format Indicator
    payload = "000201"
    # 2. Point of Initiation Method (12 = Dynamic/Amount included)
    payload += "010212"
    
    # 3. Merchant Account Information (ID 29 for PromptPay)
    # AID: A000000063000101 (Tag 00, Len 16)
    # BillerID/Phone: 0066987654321 (Tag 01, Len 13)
    merchant_data = "0016A000000063000101" + "01130066987654321" 
    payload += "29" + str(len(merchant_data)).zfill(2) + merchant_data
    
    # 4. Currency Code (53) -> 764 (THB)
    payload += "5303764"
    
    # 5. Transaction Amount (54)
    amt_str = "{:.2f}".format(float(amount))
    payload += "54" + str(len(amt_str)).zfill(2) + amt_str
    
    # 6. Country Code (58) -> TH
    payload += "5802TH"
    
    # 7. CRC (63)
    payload += "6304" # Checksum placeholder
    
    # Calculate CRC
    checksum = crc16(payload)
    return payload + checksum
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
        products = Product.objects.filter(is_active=True)
        
        # ✅ Sorting Logic
        sort_option = request.query_params.get('sort')
        if sort_option == 'price_asc':
            products = products.order_by('price')
        elif sort_option == 'price_desc':
            products = products.order_by('-price')
        else:
            products = products.order_by('-id') # Default (Newest)

        category = request.query_params.get('category')
        search = request.query_params.get('search')
        
        if category and category != "ทั้งหมด":
            products = products.filter(category=category)
        
        # ✅ Brand Filter
        brand = request.query_params.get('brand')
        if brand and brand != "ทั้งหมด":
            products = products.filter(brand=brand)

        # ✅ In Stock Filter
        in_stock = request.query_params.get('in_stock')
        if in_stock == 'true':
            products = products.filter(stock__gt=0)

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

        # ✅ Next/Prev IDs for navigation
        next_product = Product.objects.filter(id__gt=p.id, is_active=True).order_by('id').first()
        prev_product = Product.objects.filter(id__lt=p.id, is_active=True).order_by('-id').first()

        data = {
            "id": p.id, "title": p.title, "description": p.description, 
            "category": p.category, "price": p.price, "stock": p.stock, 
            "brand": getattr(p, 'brand', ''), "rating": p.rating,
            "thumbnail": p.thumbnail.url if p.thumbnail else "",
            "images": gallery,
            "reviews": reviews,
            "next_id": next_product.id if next_product else None,
            "prev_id": prev_product.id if prev_product else None
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

@api_view(['GET'])
@permission_classes([AllowAny])
def brands_api(request):
    brands = Product.objects.filter(is_active=True).exclude(brand__isnull=True).exclude(brand="").values_list('brand', flat=True).distinct()
    return Response({"brands": ["ทั้งหมด"] + list(brands)})

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
        return Response({"error": "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว (Username already exists)"}, status=400)

    # ✅ เพิ่มการตรวจสอบ Email ซ้ำ
    if User.objects.filter(email=email).exists():
        return Response({"error": "อีเมลนี้ถูกใช้งานแล้ว (Email already exists)"}, status=400)

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
        import traceback
        traceback.print_exc() # 🖨️ Print Error to Terminal for debugging
        return Response({"error": f"เกิดข้อผิดพลาด: {str(e)}"}, status=400)

@api_view(['GET'])
@permission_classes([AllowAny])
def check_username_api(request):
    username = request.query_params.get('username', None)
    if not username:
        return Response({"error": "No username provided"}, status=400)
    
    is_taken = User.objects.filter(username=username).exists()
    return Response({"available": not is_taken})

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
    # ✅ 1. รับข้อมูล items (รองรับทั้ง key 'items' และ 'cart_items')
    cart_items = request.data.get('items') or request.data.get('cart_items', [])
    customer_data = request.data.get('customer', {}) # ✅ รับข้อมูลลูกค้า (ที่อยู่/เบอร์โทร)
    
    if not cart_items: 
        return Response({"error": "ไม่พบรายการสินค้า (Empty cart)"}, status=400)

    try:
        with transaction.atomic():
            total_price = 0
            order_items_to_create = [] # เก็บไว้สร้างทีเดียว
            
            # ✅ 2. Loop รอบเดียวเพื่อตรวจสอบ Stock และคำนวณราคา
            for item in cart_items:
                try:
                    p = Product.objects.select_for_update().get(id=item['id'])
                except Product.DoesNotExist:
                    raise ValueError(f"สินค้า ID {item['id']} ไม่พบในระบบ")

                if p.stock < item['quantity']: 
                    raise ValueError(f"สินค้า '{p.title}' สินค้าหมดหรือมีไม่พอ (เหลือ {p.stock})")
                
                # คำนวณราคา
                item_total = p.price * item['quantity']
                total_price += item_total
                
                # ตัด Stock
                p.stock -= item['quantity']
                p.save()
                
                # เตรียมข้อมูลสำหรับ OrderItem
                order_items_to_create.append({
                    "product": p,
                    "quantity": item['quantity'],
                    "price": p.price
                })

            # ✅ 3. สร้าง Order (บันทึกข้อมูลที่อยู่จัดส่งด้วย)
            order = Order.objects.create(
                user=request.user,
                customer_name=customer_data.get('name', request.user.first_name or request.user.username),
                customer_tel=customer_data.get('tel', request.user.phone), 
                customer_email=customer_data.get('email', request.user.email),
                shipping_address=customer_data.get('address', request.user.address), 
                payment_method=request.data.get('paymentMethod', 'Transfer'),
                total_price=total_price,
                status='Pending'
            )
            
            # ✅ 4. สร้าง OrderItem (ใช้ราคาที่ถูกต้องของแต่ละชิ้น)
            for item_data in order_items_to_create:
                OrderItem.objects.create(
                    order=order, 
                    product=item_data['product'], 
                    quantity=item_data['quantity'], 
                    price_at_purchase=item_data['price']
                )

        return Response({"message": "สั่งซื้อสำเร็จ", "order_id": order.id}, status=201)
    except Exception as e:
        import traceback
        traceback.print_exc()
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
            
            # ✅ Generate QR Payload for Pending orders
            qr_payload = ""
            if o.status == 'Pending' and not o.slip_image:
                 qr_payload = generate_promptpay_payload(o.total_price)
                 
            data.append({
                "id": o.id, "date": date_str, 
                "total_price": o.total_price, "status": o.status, "items": items,
                "has_slip": bool(o.slip_image),
                "promptpay_payload": qr_payload # ✅ For Frontend QR
            })
        except Exception as e:
            print(f"Error processing order {o.id}: {e}")
            continue
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_admin_stats(request):
    if request.user.role not in ['seller', 'admin', 'super_admin']: return Response(status=403)
    
    # 1. Basic Stats (Global)
    # Include all confirmed sales/money-in statuses
    VALID_SALES_STATUSES = ['Paid', 'Processing', 'Shipped', 'Completed']
    total_sales = Order.objects.filter(status__in=VALID_SALES_STATUSES).aggregate(Sum('total_price'))['total_price__sum'] or 0
    total_orders = Order.objects.count()
    total_products = Product.objects.count()
    total_users = User.objects.count()

    # 2. Sales Chart Data (Dynamic Period)
    period = request.GET.get('period', 'daily')
    date_param = request.GET.get('date')
    
    if date_param:
        try:
             # Handle Javascript ISO format
            if 'T' in date_param:
                target_date = datetime.fromisoformat(date_param.replace("Z", "+00:00")).date()
            else:
                target_date = datetime.strptime(date_param, "%Y-%m-%d").date()
        except:
            target_date = timezone.now().date()
    else:
        target_date = timezone.now().date()

    # Define Filter based on Period
    # sales_filter = {'status': 'Paid'} -> CHANGED
    sales_filter = {'status__in': VALID_SALES_STATUSES}
    orders_filter = {}

    if period == 'daily':
        sales_filter['created_at__date'] = target_date
        orders_filter['created_at__date'] = target_date
    elif period == 'monthly':
        sales_filter['created_at__year'] = target_date.year
        sales_filter['created_at__month'] = target_date.month
        orders_filter['created_at__year'] = target_date.year
        orders_filter['created_at__month'] = target_date.month
    elif period == 'yearly':
        sales_filter['created_at__year'] = target_date.year
        orders_filter['created_at__year'] = target_date.year

    # 1. Basic Stats (Filtered)
    # ...
    
    total_sales = Order.objects.filter(**sales_filter).aggregate(Sum('total_price'))['total_price__sum'] or 0

    # ...

    # --- Safely Calculate Sales Data ---
    sales_data = [] # Reset/Init
    
    try:
        if period == 'daily':
            # Last 7 Days from target_date
            for i in range(6, -1, -1):
                 d = target_date - timedelta(days=i)
                 # Use status__in logic
                 sales = Order.objects.filter(status__in=VALID_SALES_STATUSES, created_at__date=d).aggregate(Sum('total_price'))['total_price__sum'] or 0
                 sales_data.append({"name": d.strftime("%d/%m"), "sales": sales})

        elif period == 'monthly':
            # Show all days in target_date's month
            _, num_days = calendar.monthrange(target_date.year, target_date.month)
            print(f"DEBUG: Monthly {target_date.month}/{target_date.year} has {num_days} days")
            for day in range(1, num_days + 1):
                 d = target_date.replace(day=day)
                 sales = Order.objects.filter(status__in=VALID_SALES_STATUSES, created_at__date=d).aggregate(Sum('total_price'))['total_price__sum'] or 0
                 sales_data.append({"name": str(day), "sales": sales})

        elif period == 'yearly':
            # Show all months in target_date's year
            print(f"DEBUG: Yearly {target_date.year}")
            months_th = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]
            for month in range(1, 13):
                 sales = Order.objects.filter(status__in=VALID_SALES_STATUSES, created_at__year=target_date.year, created_at__month=month).aggregate(Sum('total_price'))['total_price__sum'] or 0
                 sales_data.append({"name": months_th[month-1], "sales": sales})
    except Exception as e:
        print(f"DEBUG: Sales Data Calculation Error: {e}")
        sales_data = []

    # --- Safely Calculate Extra Stats ---
    best_sellers_data = []
    pie_data = []
    low_stock_data = []
    logs_data = []
    pending_orders = Order.objects.filter(status='Pending').count()

    try:
        # 2. Best Sellers (Top 5 Products) - Filtered
        best_sellers = OrderItem.objects.filter(order__in=Order.objects.filter(**orders_filter))\
            .values('product__title')\
            .annotate(total_qty=Sum('quantity'))\
            .order_by('-total_qty')[:5]
        
        best_sellers_data = [{"name": item['product__title'], "sales": item['total_qty']} for item in best_sellers]
    except Exception as e:
        print(f"DEBUG: Best Sellers Error: {e}")

    try:
        # 3. Low Stock
        low_stock_products = Product.objects.filter(stock__lte=10, is_active=True).values('id', 'title', 'stock')
        low_stock_data = list(low_stock_products) # Convert to list
    except Exception as e:
        print(f"DEBUG: Low Stock Error: {e}")

    try:
        # 4. Pie Chart
        # Use VALID_SALES_STATUSES
        category_stats = Order.objects.filter(**orders_filter, status__in=VALID_SALES_STATUSES)\
            .values('items__product__category')\
            .annotate(value=Sum('items__price_at_purchase'))\
            .order_by('-value')
        
        for c in category_stats:
            cat_name = c['items__product__category'] or "Uncategorized"
            if c['value']:
                pie_data.append({"name": cat_name, "value": c['value']})
    except Exception as e:
        print(f"DEBUG: Pie Chart Error: {e}")

    try:
        # 5. Logs
        recent_logs = AdminLog.objects.all().order_by('-timestamp')[:5]
        # Check if admin exists
        logs_data = []
        for l in recent_logs:
            user_str = "System"
            if l.admin:
                user_str = l.admin.username
            
            logs_data.append({
                "id": l.id,
                "action": l.action,
                "date": l.timestamp.strftime("%d/%m %H:%M"),
                "user": user_str,
                "target": "", 
                "time": l.timestamp.strftime("%H:%M") 
            })
    except Exception as e:
        print(f"DEBUG: Logs Error: {e}")

    return Response({
        "total_sales": total_sales,
        "total_orders": total_orders,
        "total_products": total_products,
        "total_users": total_users,
        "sales_data": sales_data,
        "best_sellers": best_sellers_data,
        "low_stock": low_stock_data,
        "pie_data": pie_data, 
        "logs": logs_data,
        "pending_orders": pending_orders
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_orders_csv(request):
    if request.user.role not in ['seller', 'admin', 'super_admin']: return Response(status=403)

    try:
        import openpyxl
        from openpyxl.styles import Font, Alignment, Border, Side, PatternFill
        from openpyxl.utils import get_column_letter

        # Create Workbook
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Orders Check"

        # Headers
        headers = ['รหัสสั่งซื้อ', 'วันที่', 'ลูกค้า', 'เบอร์โทร', 'รายการสินค้า', 'ยอดรวม', 'สถานะ', 'วิธีชำระ', 'สลิป']
        ws.append(headers)

        # Style Headers
        header_font = Font(bold=True, color="FFFFFF")
        header_fill = PatternFill(start_color="1A4D2E", end_color="1A4D2E", fill_type="solid")
        
        for col_num, header in enumerate(headers, 1):
            cell = ws.cell(row=1, column=col_num)
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = Alignment(horizontal="center", vertical="center")

        # --- Date Filtering Logic ---
        period = request.GET.get('period', 'all')
        date_param = request.GET.get('date')
        
        orders = Order.objects.all().order_by('-created_at')

        if date_param:
            try:
                if 'T' in date_param:
                    target_date = datetime.fromisoformat(date_param.replace("Z", "+00:00")).date()
                else:
                    target_date = datetime.strptime(date_param, "%Y-%m-%d").date()
                
                if period == 'daily':
                    orders = orders.filter(created_at__date=target_date)
                elif period == 'monthly':
                    orders = orders.filter(created_at__year=target_date.year, created_at__month=target_date.month)
                elif period == 'yearly':
                    orders = orders.filter(created_at__year=target_date.year)
                    
            except Exception as e:
                print(f"Export Date Parse Error: {e}")
        
        for order in orders:
            items_str = ", ".join([f"{i.product.title} (x{i.quantity})" for i in order.items.all() if i.product])
            
            row = [
                order.id,
                order.created_at.strftime("%d/%m/%Y %H:%M"),
                order.customer_name,
                order.customer_tel,
                items_str,
                float(order.total_price), # Ensure number
                order.status,
                order.payment_method,
                "แนบแล้ว" if order.slip_image else "ยังไม่แนบ"
            ]
            ws.append(row)

        # ✅ Auto-adjust Column Width
        for col in ws.columns:
            max_length = 0
            column = col[0].column_letter # Get the column name
            for cell in col:
                try:
                    if len(str(cell.value)) > max_length:
                        max_length = len(str(cell.value))
                except:
                    pass
            adjusted_width = (max_length + 2)
            ws.column_dimensions[column].width = adjusted_width

        # Response
        import io
        output = io.BytesIO()
        wb.save(output)
        output.seek(0)

        response = HttpResponse(output.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="orders_export.xlsx"'
        
        return response

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_admin_orders(request):
    if request.user.role not in ['seller', 'admin', 'super_admin']: return Response(status=403)
    
    orders = Order.objects.all().order_by('-created_at')

    # ✅ 1. Search (ID, Name, Tel)
    search = request.GET.get('search')
    if search:
        orders = orders.filter(Q(id__icontains=search) | Q(customer_name__icontains=search) | Q(customer_tel__icontains=search))
    
    # ✅ 2. Status Filter
    status = request.GET.get('status')
    if status and status != 'ทั้งหมด':
        orders = orders.filter(status=status)
        
    # ✅ 3. Date Filter
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    if start_date:
        orders = orders.filter(created_at__date__gte=start_date)
    if end_date:
        orders = orders.filter(created_at__date__lte=end_date)

    data = [{
        "id": o.id, "customer": o.customer_name, "total_price": o.total_price,
        "status": o.status, "date": o.created_at.strftime("%d/%m/%Y %H:%M"),
        "payment_method": o.payment_method,
        "slip_image": o.slip_image.url if o.slip_image else "",
        "payment_date": o.payment_date.strftime("%d/%m/%Y %H:%M") if o.payment_date else "-",
        "transfer_amount": o.transfer_amount,
        "transfer_date": o.transfer_date.strftime("%d/%m/%Y %H:%M") if o.transfer_date else "-",
        "bank_name": o.bank_name,
        "transfer_account_number": o.transfer_account_number,
        "tel": o.customer_tel,
        "items": [{
            "product": i.product.title if i.product else "Deleted Product",
            "quantity": i.quantity,
            "price": i.price_at_purchase
        } for i in o.items.all()]
    } for o in orders]
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_order_status_api(request, order_id):
    if request.user.role not in ['seller', 'admin', 'super_admin']: return Response(status=403)
    try:
        with transaction.atomic():
            order = Order.objects.get(id=order_id)
            new_status = request.data.get('status')
            old_status = order.status
            
            if not new_status:
                return Response({"error": "Status required"}, status=400)

            if new_status == old_status:
                return Response({"message": "Status unchanged"})

            # ✅ 1. Restore Stock (If cancelling)
            if new_status == 'Cancelled' and old_status != 'Cancelled':
                for item in order.items.all():
                    if item.product:
                        old_s = item.product.stock
                        item.product.stock += item.quantity
                        item.product.save()
                        log_stock_change(item.product, old_s, item.product.stock, request.user, 'cancel', f"Order #{order_id} Cancelled")
            
            # ✅ 2. Re-Deduct Stock (If un-cancelling)
            elif old_status == 'Cancelled' and new_status != 'Cancelled':
                for item in order.items.all():
                    if item.product:
                        if item.product.stock < item.quantity:
                             return Response({"error": f"สินค้า '{item.product.title}' สต็อกไม่พอ (เหลือ {item.product.stock})"}, status=400)
                        old_s = item.product.stock
                        item.product.stock -= item.quantity
                        item.product.save()
                        log_stock_change(item.product, old_s, item.product.stock, request.user, 'sale', f"Order #{order_id} Restored")

            order.status = new_status
            order.save()
            
            # Log Activity
            AdminLog.objects.create(
                admin=request.user, 
                action=f"อัปเดตสถานะออเดอร์ #{order.id}: {old_status} -> {new_status}"
            )

        return Response({"message": "Status updated"})
    except Order.DoesNotExist:
        return Response({"error": "Order not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_slip(request, order_id):
    try:
        # ✅ 1. Get Order (User can only upload for their own order)
        order = Order.objects.get(id=order_id, user=request.user)
        
        # ✅ 2. Get Image
        image = request.FILES.get('slip_image')
        if not image:
             return Response({"error": "No image provided"}, status=400)
             
        # ✅ 3. Save
        order.slip_image = image
        order.payment_date = timezone.now()
        
        # ✅ Save Strict Verifiction Data
        order.transfer_amount = request.data.get('transfer_amount')
        order.bank_name = request.data.get('bank_name')
        
        t_date = request.data.get('transfer_date') # Expect ISO string
        if t_date:
            order.transfer_date = t_date

        transfer_account_number = request.data.get('transfer_account_number')
        if transfer_account_number:
            order.transfer_account_number = transfer_account_number

        order.save()
        
        return Response({"message": "Slip uploaded successfully", "slip_url": order.slip_image.url})
        
    except Order.DoesNotExist:
        return Response({"error": "Order not found or not authorized"}, status=404)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)


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
    
    try:
        p = Product.objects.get(id=product_id)
        
        # Capture Old Values for Logging
        old_stock = p.stock
        title_before = p.title
        price_before = p.price
        category_before = p.category

        data = request.data
        p.title = data.get('title', p.title)
        p.description = data.get('description', p.description)
        p.price = data.get('price', p.price)
        
        try:
            p.stock = int(data.get('stock', p.stock))
        except:
            pass # Keep old stock if invalid

        p.category = data.get('category', p.category)
        p.brand = data.get('brand', p.brand)
        
        if 'thumbnail' in request.FILES:
            p.thumbnail = request.FILES['thumbnail']
        p.save()
        
        # Log Changes
        diff_notes = []
        if p.title != title_before: diff_notes.append(f"Title: {title_before} -> {p.title}")
        if p.price != price_before: diff_notes.append(f"Price: {price_before} -> {p.price}")
        if p.category != category_before: diff_notes.append(f"Category: {category_before} -> {p.category}")
        
        # 1. Log Stock Change
        if p.stock != old_stock:
            diff = p.stock - old_stock
            action_type = 'restock' if diff > 0 else 'adjustment'
            StockHistory.objects.create(
                product=p,
                change_quantity=diff,
                remaining_stock=p.stock,
                action=action_type,
                created_by=request.user,
                note="Manual Update via Edit Page"
            )

        # 2. Log Info Change (if any non-stock field changed)
        if diff_notes:
            StockHistory.objects.create(
                product=p,
                change_quantity=0, # No stock change
                remaining_stock=p.stock,
                action='edit', # Using new 'edit' action
                created_by=request.user,
                note=", ".join(diff_notes)
            )

        new_images = request.FILES.getlist('new_gallery_images')
        for img in new_images:
            ProductImage.objects.create(product=p, image_url=img)
            
        delete_ids = request.data.getlist('delete_image_ids')
        if delete_ids:
            ProductImage.objects.filter(id__in=delete_ids, product=p).delete()

        AdminLog.objects.create(admin=request.user, action=f"แก้ไขสินค้า: {p.title}")
        return Response({"message": "Updated"})
    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=400)

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
                old_stock = product.stock
                product.stock -= item['quantity']
                product.save()

                # Log Stock
                log_stock_change(product, old_stock, product.stock, user, 'sale', f"Order #{order.id}")

            # ✅ Generate QR Payload if Transfer
            qr_payload = ""
            if payment_method == 'Transfer':
                qr_payload = generate_promptpay_payload(total_price)

            return Response({
                "message": "สั่งซื้อสำเร็จแล้ว!",
                "order_id": order.id,
                "total_price": total_price,
                "promptpay_payload": qr_payload
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
        comment = data.get('comment', '')

        if not product_id or not rating:
            return Response({"error": "กรุณาระบุรหัสสินค้าและคะแนน"}, status=400)

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "ไม่พบสินค้าชิ้นนี้"}, status=404)

        # ✅ Use update_or_create to prevent duplicates/errors
        Review.objects.update_or_create(
            user=user,
            product=product,
            defaults={
                'rating': int(rating),
                'comment': comment,
                'created_at': timezone.now() # Update timestamp if edited? No, keep original createdAt usually.
                # Actually, if updating, we might want to update timestamp. But let's keep it simple.
            }
        )

        # Recalculate Average
        all_reviews = product.reviews.all()
        if all_reviews.exists():
            avg_rating = all_reviews.aggregate(Sum('rating'))['rating__sum'] / all_reviews.count()
            product.rating = round(avg_rating, 1)
        else:
            product.rating = 0
            
        product.save()
        
        return Response({"message": "บันทึกรีวิวสำเร็จ", "rating": product.rating}, status=201)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reply_review_api(request, review_id):
    try:
        review = Review.objects.get(id=review_id)
        # Check if user is admin/seller
        if request.user.role not in ['admin', 'super_admin', 'seller']:
            return Response(status=403)
            
        review.reply_comment = request.data.get('reply', '')
        review.reply_timestamp = timezone.now() # ✅ Create Timestamp
        review.save()
        
        return Response({
            "message": "Reply added",
            "reply_comment": review.reply_comment,
            "reply_date": review.reply_timestamp.strftime("%d/%m/%Y %H:%M") # ✅ Return formatted date
        })
    except Review.DoesNotExist:
        return Response({"error": "Review not found"}, status=404)

# ==============================
# 🔔 Notification API
# ==============================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    user = request.user
    notifications = []
    
    # Logic for Admin/Seller: Check for Pending Orders
    if user.role in ['admin', 'super_admin', 'seller']:
        pending_orders = Order.objects.filter(status='Pending').order_by('-created_at')[:5]
        for o in pending_orders:
            notifications.append({
                "id": f"order_{o.id}",
                "title": f"คำสั่งซื้อใหม่ #{o.id}",
                "message": f"ยอด ฿{o.total_price:,.2f} จาก {o.customer_name}",
                "time": o.created_at.strftime("%H:%M") if o.created_at else "",
                "type": "order"
            })
            
    # Logic for Customer: Check for Shipped/Cancelled Orders
    else:
        my_updates = Order.objects.filter(user=user).exclude(status='Pending').order_by('-updated_at')[:5]
        for o in my_updates:
            msg = ""
            bg_type = "info"
            if o.status == 'Paid':
                msg = "การชำระเงินได้รับการอนุมัติแล้ว"
                bg_type = "success"
            elif o.status == 'Shipped':
                msg = "สินค้าของคุณถูกจัดส่งแล้ว"
                bg_type = "success"
            elif o.status == 'Cancelled':
                msg = "คำสั่งซื้อถูกยกเลิก"
                bg_type = "alert"
                
            notifications.append({
                "id": f"update_{o.id}",
                "title": f"อัปเดตคำสั่งซื้อ #{o.id}",
                "message": msg,
                "time": o.updated_at.strftime("%d/%m %H:%M"),
                "type": bg_type
            })

    return Response(notifications)


# ==============================
# 💳 Payment Helper API
# ==============================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_promptpay_payload(request):
    try:
        amount = float(request.data.get('amount', 0))
        if amount <= 0:
            return Response({"error": "Invalid amount"}, status=400)
            
        payload = generate_promptpay_payload(amount)
        return Response({"payload": payload})
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['GET'])
def get_related_products(request, product_id):
    try:
        current_product = Product.objects.get(id=product_id)
        # Fetch 4 products from same category, excluding current
        related = Product.objects.filter(category=current_product.category, is_active=True).exclude(id=product_id).order_by('?')[:4]
        
        data = [{
            "id": p.id,
            "title": p.title,
            "price": p.price,
            "image": p.thumbnail.url if p.thumbnail else "",
            "category": p.category,
            "rating": p.rating,
            "brand": p.brand
        } for p in related]
        return Response(data)
    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=404)

# ==============================
# 📦 Inventory Management
# ==============================

def log_stock_change(product, old_stock, new_stock, user, action, note=""):
    diff = new_stock - old_stock
    if diff == 0:
        return
    
    try:
        StockHistory.objects.create(
            product=product,
            change_quantity=diff,
            remaining_stock=new_stock,
            action=action,
            created_by=user if user and user.is_authenticated else None, # Handle Anonymous/System
            note=note
        )
    except Exception as e:
        print(f"Error logging stock: {e}")

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_stock_history(request, product_id):
    try:
        history = StockHistory.objects.filter(product_id=product_id)
        data = [{
            "id": h.id,
            "change": h.change_quantity,
            "remaining": h.remaining_stock,
            "action": h.get_action_display(),
            "reason": h.note,
            "user": h.created_by.username if h.created_by else "System",
            "date": h.created_at.strftime("%d/%m/%Y %H:%M")
        } for h in history]
        return Response(data)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_related_products(request, product_id):
    try:
        product = Product.objects.get(id=product_id)
        # Find products in the same category, excluding itself
        related = Product.objects.filter(category=product.category, is_active=True).exclude(id=product_id).order_by('?')[:4]
        
        data = []
        for p in related:
             data.append({
                "id": p.id,
                "title": p.title,
                "price": p.price,
                "thumbnail": p.thumbnail.url if p.thumbnail else "",
                "image": p.thumbnail.url if p.thumbnail else "" 
             })
        return Response(data)
    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_api(request):
    """
    Allow resetting password directly via email.
    WARNING: In production, this should use a secure token sent to email.
    For this specific user request/environment, we are allowing direct reset by checking email.
    """
    email = request.data.get('email')
    new_password = request.data.get('new_password')

    if not email or not new_password:
        return Response({"error": "Email and new password are required"}, status=400)

    try:
        user = User.objects.get(email=email)
        user.set_password(new_password)
        user.save()
        return Response({"message": "Password updated successfully"})
    except User.DoesNotExist:
        return Response({"error": "User with this email not found"}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_stock_history(request):
    """
    ดึงประวัติสต็อกทั้งหมด (Global Stock History)
    รองรับการค้นหาและ filter
    """
    # Check Admin
    if request.user.role not in ['admin', 'super_admin', 'seller']:
         return Response({"error": "Unauthorized"}, status=403)

    history = StockHistory.objects.select_related('product', 'created_by').all().order_by('-created_at')
    
    # Filter by Product Category (NEW)
    category = request.query_params.get('category')
    if category and category != 'all':
        history = history.filter(product__category=category)
    
    # Filter by Product Name
    search_query = request.query_params.get('search', '')
    if search_query:
        history = history.filter(product__title__icontains=search_query)

    # Filter by Action
    action_filter = request.query_params.get('action', '')
    if action_filter and action_filter != 'all':
         history = history.filter(action=action_filter)

    data = []
    for h in history:
        # Determine User Display
        user_display = "System"
        if h.created_by:
            user_display = h.created_by.username
            # Optional: Add role if needed e.g. "admin_bob (Admin)"

        data.append({
            "id": h.id,
            "product_name": h.product.title,
            "product_image": h.product.thumbnail.url if h.product.thumbnail else None,
            "change": h.change_quantity,
            "remaining": h.remaining_stock,
            "action": h.get_action_display(), 
            "note": h.note,
            "user": user_display,
            "date": h.created_at.strftime("%d/%m/%Y %H:%M"),
            "timestamp": h.created_at
        })
    
    return Response(data)
