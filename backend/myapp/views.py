from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, AllowAny
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta
from .models import Product, Order, OrderItem, Review

# ==========================================
# 🛒 ส่วนของ Public API (ใครก็เข้าถึงได้)
# ==========================================

@api_view(['GET'])
@permission_classes([AllowAny])
def products_api(request):
    products = Product.objects.all()
    data = []
    for p in products:
        data.append({
            "id": p.id,
            "title": p.title,
            "category": p.category,
            "price": p.price,
            "stock": p.stock,
            "thumbnail": p.thumbnail.url if p.thumbnail else "",
        })
    return Response(data)

@api_view(['GET'])
@permission_classes([AllowAny])
def products_api(request):
    products = Product.objects.all()
    
    # ส่วนกรองข้อมูล (Filter)
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

    # ส่วนเรียงลำดับ (Sort)
    if sort == 'price_asc':
        products = products.order_by('price')
    elif sort == 'price_desc':
        products = products.order_by('-price')
    else: # newest
        products = products.order_by('-id')

    data = []
    for p in products:
        data.append({
            "id": p.id,
            "title": p.title,
            "category": p.category,
            "price": p.price,
            "stock": p.stock,
            "description": p.description,
            "rating": p.rating,
            "thumbnail": p.thumbnail.url if p.thumbnail else "",
        })
        
    # ✅ แก้ไขตรงนี้: ห่อ data ด้วย {"products": ...}
    return Response({"products": data})

    

# ==========================================
# 👮 ส่วนของ Admin API (ต้องเป็น Superuser)
# ==========================================

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_admin_stats(request):
    # --- ข้อมูลสรุปยอดรวม ---
    total_sales = Order.objects.filter(status='Delivered').aggregate(Sum('total_price'))['total_price__sum'] or 0
    total_orders = Order.objects.count()
    total_products = Product.objects.count()
    
    # สินค้าใกล้หมด (น้อยกว่า 5 ชิ้น)
    low_stock_products = Product.objects.filter(stock__lt=5).values('id', 'title', 'stock')

    # --- 1. กราฟยอดขาย 7 วัน (Logic ใหม่: แม่นยำกว่า) ---
    today = timezone.now()
    # ตัดเวลาทิ้งเอาแต่วันที่ เพื่อการเปรียบเทียบที่แน่นอน
    last_7_days = today.date() - timedelta(days=6)

    # ดึงข้อมูลเฉพาะวันที่ที่มีการขายจริง (สถานะ Delivered เท่านั้น)
    sales_data = Order.objects.filter(
        status='Delivered',
        created_at__date__gte=last_7_days
    ).values('created_at__date').annotate(total=Sum('total_price')).order_by('created_at__date')

    # สร้าง Dictionary จับคู่วันที่กับยอดขาย เพื่อความเร็วในการค้นหา
    sales_dict = {item['created_at__date']: item['total'] for item in sales_data}

    graph_sales = []
    # Loop ย้อนหลัง 7 วัน (รวมวันนี้) เพื่อสร้างแกน X ให้ครบทุกวัน
    for i in range(6, -1, -1):
        date_cursor = today.date() - timedelta(days=i)
        day_name = date_cursor.strftime('%d/%m') # แปลงเป็นชื่อวัน เช่น 25/12
        
        # ดึงยอดขายจาก Dict ถ้าไม่มีให้ใส่ 0
        total = sales_dict.get(date_cursor, 0)
        graph_sales.append({'name': day_name, 'total': total})

    # --- 2. กราฟหมวดหมู่สินค้าขายดี ---
    category_data = OrderItem.objects.filter(order__status='Delivered')\
        .values('product__category')\
        .annotate(total_qty=Sum('quantity'))\
        .order_by('-total_qty')[:5]
    
    graph_category = [
        {'name': item['product__category'], 'value': item['total_qty']} 
        for item in category_data
    ]

    # --- 3. ออเดอร์ล่าสุด ---
    recent_orders = Order.objects.all().order_by('-created_at')[:5].values(
        'id', 'customer_name', 'total_price', 'status', 'created_at'
    )

    return Response({
        "total_sales": total_sales,
        "total_orders": total_orders,
        "total_products": total_products,
        "low_stock_products": low_stock_products,
        "graph_sales": graph_sales,       # ข้อมูลกราฟเส้น (แก้ไขแล้ว)
        "graph_category": graph_category, # ข้อมูลกราฟแท่ง
        "recent_orders": recent_orders
    })
@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login_api(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(request, username=username, password=password)
    
    if user is not None:
        login(request, user)
        return Response({
            "message": "Login successful",
            "user": {
                "id": user.id,
                "username": user.username,
                "is_superuser": user.is_superuser
            }
        })
    else:
        return Response({"error": "Invalid credentials"}, status=400)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def register_api(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email', '')

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already exists"}, status=400)

    user = User.objects.create_user(username=username, password=password, email=email)
    return Response({"message": "User created successfully"})