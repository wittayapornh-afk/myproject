from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction
from django.db.models import Avg, Sum, Count
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.core.files.base import ContentFile
import json
import requests
from .models import Product, ProductImage, Review, Order, OrderItem

def fetch_api(request):
    try:
        url = "https://dummyjson.com/products?limit=30"
        response = requests.get(url)
        data = response.json()
        for item in data.get("products", []):
            product, _ = Product.objects.update_or_create(
                id=item["id"],
                defaults={
                    "title": item["title"],
                    "description": item["description"],
                    "category": item["category"],
                    "price": item["price"],
                    "rating": item.get("rating", 0),
                    "stock": item.get("stock", 0),
                    "brand": item.get("brand", ""),
                }
            )
            if item.get("thumbnail") and not product.thumbnail:
                try:
                    img_resp = requests.get(item.get("thumbnail"))
                    if img_resp.status_code == 200:
                        fname = item.get("thumbnail").split("/")[-1]
                        product.thumbnail.save(fname, ContentFile(img_resp.content), save=True)
                except: pass
        return HttpResponse("Import API success!")
    except Exception as e:
        return HttpResponse(f"Error: {str(e)}", status=500)

@csrf_exempt
def api_products(request):
    if request.method == "GET":
        qs = Product.objects.all()
        cat = request.GET.get('category')
        if cat and cat != "ทั้งหมด": qs = qs.filter(category=cat)
        search = request.GET.get('search')
        if search: qs = qs.filter(title__icontains=search)
        
        min_price = request.GET.get('min_price')
        max_price = request.GET.get('max_price')
        if min_price: qs = qs.filter(price__gte=min_price)
        if max_price: qs = qs.filter(price__lte=max_price)

        sort = request.GET.get('sort')
        if sort == 'price_asc': qs = qs.order_by('price')
        elif sort == 'price_desc': qs = qs.order_by('-price')
        else: qs = qs.order_by('-id')
        
        products_data = []
        for p in qs:
            img = request.build_absolute_uri(p.thumbnail.url) if p.thumbnail else ""
            products_data.append({
                "id": p.id, "title": p.title, "description": p.description,
                "category": p.category, "price": p.price, "rating": p.rating,
                "stock": p.stock, "brand": p.brand, "thumbnail": img,
            })
        return JsonResponse({"products": products_data})
    
    elif request.method == "POST":
        try:
            data = request.POST
            files = request.FILES
            product = Product.objects.create(
                title=data.get("title"), description=data.get("description"),
                category=data.get("category"), price=float(data.get("price", 0)),
                stock=int(data.get("stock", 0)), brand=data.get("brand"),
                thumbnail=files.get("thumbnail")
            )
            if "images" in files:
                for f in files.getlist("images"):
                    ProductImage.objects.create(product=product, image=f)
            return JsonResponse({"message": "Success", "id": product.id}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
def api_product_detail(request, product_id):
    try:
        p = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return JsonResponse({"error": "Not found"}, status=404)

    if request.method == "GET":
        images = [request.build_absolute_uri(i.image.url) for i in p.images.all() if i.image]
        thumb = request.build_absolute_uri(p.thumbnail.url) if p.thumbnail else ""
        reviews = list(p.reviews.values('user', 'rating', 'comment', 'created_at').order_by('-created_at'))
        return JsonResponse({
            "id": p.id, "title": p.title, "description": p.description,
            "price": p.price, "category": p.category, "stock": p.stock,
            "rating": p.rating, "thumbnail": thumb, "images": images, "reviews": reviews
        })
    elif request.method == "PUT":
        data = json.loads(request.body)
        p.title = data.get("title", p.title)
        p.price = data.get("price", p.price)
        p.stock = data.get("stock", p.stock)
        p.category = data.get("category", p.category)
        p.description = data.get("description", p.description)
        p.save()
        return JsonResponse({"message": "Updated"})
    elif request.method == "DELETE":
        p.delete()
        return JsonResponse({"message": "Deleted"})

def api_categories(request):
    cats = Product.objects.values_list('category', flat=True).distinct().order_by('category')
    return JsonResponse({"categories": ["ทั้งหมด"] + list(cats)})

@csrf_exempt
def api_add_review(request, product_id):
    if request.method == "POST":
        data = json.loads(request.body)
        p = Product.objects.get(id=product_id)
        Review.objects.create(product=p, user=data.get("name"), rating=int(data.get("rating")), comment=data.get("comment"))
        p.rating = round(p.reviews.aggregate(Avg('rating'))['rating__avg'] or 0, 1)
        p.save()
        return JsonResponse({"message": "Review added"})

@csrf_exempt
def api_checkout(request):
    if request.method == "POST":
        data = json.loads(request.body)
        items = data.get("items", [])
        customer = data.get("customer", {})
        user_id = data.get("user_id")
        
        total = sum(i['price'] * i['quantity'] for i in items)
        try:
            with transaction.atomic():
                order = Order.objects.create(
                    user_id=user_id, customer_name=customer.get('name'),
                    customer_tel=customer.get('tel'), address=customer.get('address'),
                    total_price=total, status='Processing'
                )
                for i in items:
                    p = Product.objects.select_for_update().get(id=i["id"])
                    if p.stock < i["quantity"]: raise Exception(f"Product {p.title} out of stock")
                    p.stock -= i["quantity"]
                    p.save()
                    OrderItem.objects.create(order=order, product=p, quantity=i["quantity"], price=i["price"])
            return JsonResponse({"message": "Order success", "order_id": order.id})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
def api_order_history(request):
    user_id = request.GET.get('user_id')
    tel = request.GET.get('tel')
    if user_id: orders = Order.objects.filter(user_id=user_id).order_by('-created_at')
    elif tel: orders = Order.objects.filter(customer_tel=tel).order_by('-created_at')
    else: return JsonResponse({"error": "Required user_id or tel"}, status=400)
    
    data = []
    for o in orders:
        items = [{"product_title": i.product.title, "quantity": i.quantity, "price": i.price} for i in o.items.all()]
        data.append({"id": o.id, "status": o.get_status_display(), "total_price": o.total_price, "created_at": o.created_at, "items": items})
    return JsonResponse({"orders": data})

@csrf_exempt
def api_register(request):
    if request.method == "POST":
        data = json.loads(request.body)
        if User.objects.filter(username=data.get("username")).exists():
            return JsonResponse({"error": "Username taken"}, status=400)
        user = User.objects.create_user(username=data.get("username"), password=data.get("password"), email=data.get("email"), first_name=data.get("first_name"))
        return JsonResponse({"message": "Success", "user_id": user.id})

@csrf_exempt
def api_login(request):
    if request.method == "POST":
        data = json.loads(request.body)
        user = authenticate(username=data.get("username"), password=data.get("password"))
        if user:
            return JsonResponse({"message": "Success", "user": {"id": user.id, "username": user.username, "first_name": user.first_name, "is_superuser": user.is_superuser}})
        return JsonResponse({"error": "Invalid credentials"}, status=401)

def api_dashboard_stats(request):
    return JsonResponse({
        "total_sales": Order.objects.aggregate(Sum('total_price'))['total_price__sum'] or 0,
        "total_orders": Order.objects.count(),
        "total_products": Product.objects.count(),
        "low_stock_products": list(Product.objects.filter(stock__lt=5).values('id', 'title', 'stock')),
        "recent_orders": list(Order.objects.order_by('-created_at')[:5].values('id', 'customer_name', 'total_price', 'status'))
    })