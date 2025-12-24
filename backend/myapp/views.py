from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.db.models import Sum, Q, Count
from .models import Product, Order, OrderItem, UserProfile, ActivityLog, ProductImage
from django.contrib.auth.models import User
from django.utils import timezone
import datetime

# =========================================
# 🔐 Authentication APIs
# =========================================

@api_view(['POST'])
@permission_classes([AllowAny])
def login_api(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        try: profile = user.profile
        except UserProfile.DoesNotExist: profile = UserProfile.objects.create(user=user, role='user')
        return Response({'token': token.key, 'user': {'id': user.id, 'username': user.username, 'role': profile.role}})
    return Response({'error': 'Invalid credentials'}, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_api(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')
    if User.objects.filter(username=username).exists(): return Response({'error': 'Existed'}, 400)
    try:
        user = User.objects.create_user(username, email, password)
        UserProfile.objects.create(user=user, role='user')
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user': {'id': user.id, 'username': user.username, 'role': 'user'}}, 201)
    except Exception as e: return Response({'error': str(e)}, 400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_api(request):
    request.user.auth_token.delete()
    return Response({'message': 'Logged out'})

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def user_profile_api(request):
    user = request.user
    try: profile = user.profile
    except: profile = UserProfile.objects.create(user=user)
    if request.method == 'POST':
        if 'phone' in request.data: profile.phone = request.data['phone']
        if 'address' in request.data: profile.address = request.data['address']
        profile.save()
    return Response({'username': user.username, 'email': user.email, 'phone': profile.phone, 'address': profile.address, 'role': profile.role})

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_all_users(request):
    users = User.objects.all().order_by('-date_joined')
    data = [{'id': u.id, 'username': u.username, 'email': u.email, 'role': getattr(u, 'profile', None).role if hasattr(u, 'profile') else 'user', 'date_joined': u.date_joined.strftime("%Y-%m-%d")} for u in users]
    return Response(data)

# =========================================
# 📊 Dashboard API (แก้ไขจุดที่พัง)
# =========================================
class DashboardStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        try:
            # 1. รับค่าและกรองออเดอร์
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            
            orders = Order.objects.all()
            if start_date and end_date:
                # ใช้ string ตรงๆ ถ้า DB รองรับ หรือแปลงเป็น date object
                orders = orders.filter(created_at__date__range=[start_date, end_date])

            # 2. คำนวณยอดขาย (แปลงเป็น float กันเหนียว)
            total_sales_dec = orders.aggregate(Sum('total_price'))['total_price__sum'] or 0
            total_sales = float(total_sales_dec)

            total_orders = orders.count()
            total_users = User.objects.count()
            pending_orders = orders.filter(status='Pending').count()

            # 3. Pie Chart (ใส่ Try-Except กันพัง)
            pie_data = []
            try:
                cat_sales = OrderItem.objects.filter(order__in=orders).values('product__category')\
                    .annotate(value=Sum('price')).order_by('-value')
                pie_data = [{"name": i['product__category'] or 'Uncategorized', "value": float(i['value'] or 0)} for i in cat_sales]
            except Exception as e: print(f"Pie Error: {e}")

            # 4. Bar Chart
            bar_data = []
            try:
                top_pd = OrderItem.objects.filter(order__in=orders).values('product__title')\
                    .annotate(sales=Sum('quantity')).order_by('-sales')[:5]
                bar_data = [{"name": i['product__title'], "sales": int(i['sales'] or 0)} for i in top_pd]
            except Exception as e: print(f"Bar Error: {e}")

            # 5. Logs (ถ้าตาราง Log พัง ให้ข้ามไป)
            logs_data = []
            try:
                logs = ActivityLog.objects.all().order_by('-timestamp')[:10]
                logs_data = [{
                    "user": l.user.username if l.user else "System",
                    "action": l.action,
                    "target": l.target,
                    "time": l.timestamp.strftime("%d/%m %H:%M")
                } for l in logs]
            except Exception as e: print(f"Log Error: {e}")

            return Response({
                "total_sales": total_sales,
                "total_orders": total_orders,
                "total_users": total_users,
                "pending_orders": pending_orders,
                "pie_data": pie_data,
                "bar_data": bar_data,
                "logs": logs_data,
                "sales_data": [{"name": "Sales", "sales": total_sales}],
                "best_sellers": bar_data,
                "low_stock": []
            })
        except Exception as e:
            # 🔥 ปริ้น Error ลง Terminal เพื่อให้รู้สาเหตุที่แท้จริง
            print(f"❌ DASHBOARD CRITICAL ERROR: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)

# =========================================
# 🛍️ Product APIs
# =========================================
@api_view(['GET'])
@permission_classes([AllowAny])
def products_api(request):
    try:
        paginator = PageNumberPagination()
        paginator.page_size = 12
        products = Product.objects.filter(is_active=True).order_by('-id')
        if request.query_params.get('category') and request.query_params.get('category') != 'ทั้งหมด':
            products = products.filter(category=request.query_params.get('category'))
        if request.query_params.get('search'):
            products = products.filter(title__icontains=request.query_params.get('search'))
        result = paginator.paginate_queryset(products, request)
        data = [{'id': p.id, 'title': p.title, 'price': p.price, 'stock': p.stock, 'category': p.category, 'thumbnail': p.thumbnail.url if p.thumbnail else None} for p in result]
        return paginator.get_paginated_response(data)
    except Exception as e: return Response({'error': str(e)}, 500)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_all_products_admin_api(request):
    products = Product.objects.all().order_by('-id')
    data = [{'id': p.id, 'title': p.title, 'price': p.price, 'stock': p.stock, 'category': p.category, 'thumbnail': p.thumbnail.url if p.thumbnail else None, 'is_active': p.is_active} for p in products]
    return Response(data)

@api_view(['GET'])
@permission_classes([AllowAny])
def categories_api(request):
    return Response({'categories': ['ทั้งหมด'] + list(filter(None, Product.objects.values_list('category', flat=True).distinct()))})

@api_view(['GET'])
def product_detail_api(request, product_id):
    try:
        p = Product.objects.get(id=product_id)
        images = [{"id": i.id, "image": i.image.url} for i in p.images.all()]
        return Response({'id': p.id, 'title': p.title, 'price': p.price, 'stock': p.stock, 'category': p.category, 'description': p.description, 'thumbnail': p.thumbnail.url if p.thumbnail else None, 'images': images})
    except: return Response({'error': 'Not found'}, 404)

# =========================================
# 🛠️ Admin Management
# =========================================
@api_view(['POST'])
@permission_classes([IsAdminUser])
def add_product_api(request):
    try:
        d = request.data
        p = Product.objects.create(title=d.get('name'), price=d.get('price',0), stock=d.get('stock',0), category=d.get('category','General'), description=d.get('description',''), thumbnail=request.FILES.get('image'))
        for img in request.FILES.getlist('images'): ProductImage.objects.create(product=p, image=img)
        try: ActivityLog.objects.create(user=request.user, action="เพิ่ม", target=p.title)
        except: pass
        return Response({'message': 'Success'}, 201)
    except Exception as e: return Response({'error': str(e)}, 400)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def edit_product_api(request, product_id):
    try:
        p = Product.objects.get(id=product_id)
        d = request.data
        if d.get('name'): p.title = d['name']
        if d.get('price'): p.price = d['price']
        if d.get('stock'): p.stock = d['stock']
        if d.get('category'): p.category = d['category']
        if d.get('description'): p.description = d['description']
        if request.FILES.get('image'): p.thumbnail = request.FILES.get('image')
        p.save()
        for img in request.FILES.getlist('images'): ProductImage.objects.create(product=p, image=img)
        try: ActivityLog.objects.create(user=request.user, action="แก้ไข", target=p.title)
        except: pass
        return Response({'message': 'Updated'})
    except Exception as e: return Response({'error': str(e)}, 400)

@api_view(['DELETE', 'POST'])
@permission_classes([IsAdminUser])
def delete_product_api(request, product_id):
    Product.objects.get(id=product_id).delete()
    return Response({'message': 'Deleted'})

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_product_image_api(request, image_id):
    ProductImage.objects.get(id=image_id).delete()
    return Response({'message': 'Deleted'})

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_orders_api(request):
    orders = Order.objects.all().order_by('-created_at')
    search = request.query_params.get('search')
    if search: orders = orders.filter(Q(id__icontains=search) | Q(customer_name__icontains=search) | Q(customer_tel__icontains=search))
    if request.query_params.get('start_date') and request.query_params.get('end_date'):
        orders = orders.filter(created_at__date__range=[request.query_params.get('start_date'), request.query_params.get('end_date')])
    if request.query_params.get('status') and request.query_params.get('status') != 'ทั้งหมด':
        orders = orders.filter(status=request.query_params.get('status'))
    data = []
    for o in orders:
        items = [{'product': i.product.title, 'quantity': i.quantity} for i in o.items.all()]
        data.append({'id': o.id, 'customer': o.customer_name or o.user.username, 'tel': o.customer_tel, 'total_price': o.total_price, 'status': o.status, 'created_at': o.created_at.strftime("%Y-%m-%d %H:%M"), 'items': items})
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def update_order_status_api(request, order_id):
    o = Order.objects.get(id=order_id)
    o.status = request.data.get('status')
    o.save()
    try: ActivityLog.objects.create(user=request.user, action="อัปเดตสถานะ", target=f"Order #{o.id}")
    except: pass
    return Response({'message': 'Updated'})

# =========================================
# 📦 Checkout & User Orders
# =========================================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def checkout_api(request):
    try:
        items = request.data.get('items', [])
        total = request.data.get('total', 0)
        order = Order.objects.create(user=request.user, total_price=total, customer_name=request.data.get('name', ''), customer_tel=request.data.get('tel', ''), address=request.data.get('address', ''), status='Pending')
        for item in items:
            OrderItem.objects.create(order=order, product_id=item['id'], quantity=item['quantity'], price=Product.objects.get(id=item['id']).price)
        return Response({'message': 'Success', 'order_id': order.id}, 201)
    except Exception as e: return Response({'error': str(e)}, 400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_orders_api(request):
    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    return Response([{'id': o.id, 'date': o.created_at.strftime("%Y-%m-%d"), 'total': o.total_price, 'status': o.status} for o in orders])