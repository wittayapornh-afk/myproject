from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.pagination import PageNumberPagination
from .models import Product, Order, OrderItem
from django.db.models import Sum
from django.utils import timezone
from datetime import timedelta

@api_view(['GET'])
@permission_classes([AllowAny])
def products_api(request):
    products = Product.objects.all()
    
    # Filter Logic
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

    # Sort
    if sort == 'price_asc':
        products = products.order_by('price')
    elif sort == 'price_desc':
        products = products.order_by('-price')
    else:
        products = products.order_by('-id')

    # ✅ Pagination (ตัวสำคัญ)
    paginator = PageNumberPagination()
    paginator.page_size = 12
    result_page = paginator.paginate_queryset(products, request)

    # เตรียม Data
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

@api_view(['GET'])
@permission_classes([AllowAny])
def product_detail_api(request, product_id):
    try:
        p = Product.objects.get(id=product_id)
        
        gallery_images = []
        for img in p.images.all():
            try:
                gallery_images.append(request.build_absolute_uri(img.image.url))
            except:
                pass
        
        thumbnail_url = ""
        if p.thumbnail:
            try:
                thumbnail_url = request.build_absolute_uri(p.thumbnail.url)
            except:
                pass

        reviews = p.reviews.all().order_by('-created_at')
        reviews_data = [{
            "id": r.id,
            "user": r.user.username if r.user else "Anonymous",
            "rating": r.rating,
            "comment": r.comment,
            "date": r.created_at.strftime("%d/%m/%Y")
        } for r in reviews]

        data = {
            "id": p.id,
            "title": p.title,
            "description": p.description,
            "category": p.category,
            "price": p.price,
            "stock": p.stock,
            "brand": getattr(p, 'brand', ''), 
            "rating": p.rating,
            "thumbnail": thumbnail_url,
            "images": gallery_images,
            "reviews": reviews_data
        }
        return Response(data)
    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=404)

@api_view(['GET'])
@permission_classes([AllowAny])
def categories_api(request):
    categories = Product.objects.values_list('category', flat=True).distinct()
    return Response({"categories": ["ทั้งหมด"] + list(categories)})

@api_view(['GET'])
@permission_classes([AllowAny]) 
def get_admin_stats(request):
    total_sales = Order.objects.filter(status='Delivered').aggregate(Sum('total_price'))['total_price__sum'] or 0
    total_orders = Order.objects.count()
    total_products = Product.objects.count()
    low_stock_products = Product.objects.filter(stock__lt=5).values('id', 'title', 'stock')

    today = timezone.now()
    last_7_days = today.date() - timedelta(days=6)

    sales_data = Order.objects.filter(
        status='Delivered',
        created_at__date__gte=last_7_days
    ).values('created_at__date').annotate(total=Sum('total_price')).order_by('created_at__date')

    sales_dict = {item['created_at__date']: item['total'] for item in sales_data}

    graph_sales = []
    for i in range(6, -1, -1):
        date_cursor = today.date() - timedelta(days=i)
        day_name = date_cursor.strftime('%d/%m')
        total = sales_dict.get(date_cursor, 0)
        graph_sales.append({'name': day_name, 'total': total})

    category_data = OrderItem.objects.filter(order__status='Delivered')\
        .values('product__category')\
        .annotate(total_qty=Sum('quantity'))\
        .order_by('-total_qty')[:5]
    
    graph_category = [
        {'name': item['product__category'], 'value': item['total_qty']} 
        for item in category_data
    ]

    recent_orders = Order.objects.all().order_by('-created_at')[:5].values(
        'id', 'customer_name', 'total_price', 'status', 'created_at'
    )

    return Response({
        "total_sales": total_sales,
        "total_orders": total_orders,
        "total_products": total_products,
        "low_stock_products": low_stock_products,
        "graph_sales": graph_sales,
        "graph_category": graph_category,
        "recent_orders": recent_orders
    })