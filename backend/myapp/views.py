from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction
from django.db.models import Avg
from django.core.files.base import ContentFile
import json
import requests
from .models import Product, ProductImage, Review, Order, OrderItem

# --- 1. ระบบดึงข้อมูลตัวอย่าง (Seeding) ---
def fetch_products():
    url = "https://dummyjson.com/products?limit=30"
    response = requests.get(url)
    data = response.json()
    products_list = data.get("products", [])
    
    count = 0
    for item in products_list:
        product, created = Product.objects.update_or_create(
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

        # Download Thumbnail
        thumb_url = item.get("thumbnail")
        if thumb_url and not product.thumbnail:
            try:
                img_resp = requests.get(thumb_url)
                if img_resp.status_code == 200:
                    fname = thumb_url.split("/")[-1]
                    product.thumbnail.save(fname, ContentFile(img_resp.content), save=True)
            except Exception as e:
                print(f"Error downloading thumbnail: {e}")

        # Download Gallery Images
        ProductImage.objects.filter(product=product).delete()
        for img_url in item.get("images", []):
            try:
                img_resp = requests.get(img_url)
                if img_resp.status_code == 200:
                    fname = img_url.split("/")[-1]
                    new_img = ProductImage(product=product)
                    new_img.image.save(fname, ContentFile(img_resp.content), save=True)
            except Exception as e:
                print(f"Error downloading gallery: {e}")
        count += 1
    return count

def fetch_api(request):
    try:
        count = fetch_products()
        return HttpResponse(f"Import API success! Saved {count} products.")
    except Exception as e:
        return HttpResponse(f"Error: {str(e)}", status=500)

# --- 2. API สินค้า (Products) ---
@csrf_exempt
def api_products(request):
    if request.method == "GET":
        products_queryset = Product.objects.all()

        # Filtering
        category = request.GET.get('category')
        if category and category != "ทั้งหมด":
            products_queryset = products_queryset.filter(category=category)

        search = request.GET.get('search')
        if search:
            products_queryset = products_queryset.filter(title__icontains=search)

        min_price = request.GET.get('min_price')
        max_price = request.GET.get('max_price')
        if min_price:
            products_queryset = products_queryset.filter(price__gte=min_price)
        if max_price:
            products_queryset = products_queryset.filter(price__lte=max_price)

        # Sorting
        sort = request.GET.get('sort')
        if sort == 'price_asc':
            products_queryset = products_queryset.order_by('price')
        elif sort == 'price_desc':
            products_queryset = products_queryset.order_by('-price')
        elif sort == 'newest':
            products_queryset = products_queryset.order_by('-id')
        else:
            products_queryset = products_queryset.order_by('-id')

        products_data = []
        for p in products_queryset:
            image_url = ""
            if p.thumbnail:
                image_url = request.build_absolute_uri(p.thumbnail.url)
            
            products_data.append({
                "id": p.id,
                "title": p.title,
                "description": p.description,
                "category": p.category,
                "price": p.price,
                "rating": p.rating,
                "stock": p.stock,
                "brand": p.brand,
                "thumbnail": image_url,
            })
        return JsonResponse({"products": products_data})

    elif request.method == "POST":
        try:
            data = request.POST
            files = request.FILES
            new_product = Product.objects.create(
                title=data.get("title"),
                description=data.get("description", ""),
                category=data.get("category", "General"),
                price=float(data.get("price", 0) or 0),
                rating=float(data.get("rating", 0) or 0),
                stock=int(data.get("stock", 0) or 0),
                brand=data.get("brand", ""),
                thumbnail=files.get("thumbnail")
            )
            if "images" in files:
                for f in files.getlist("images"):
                    ProductImage.objects.create(product=new_product, image=f)
            return JsonResponse({"message": "Success", "id": new_product.id}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
def api_product_detail(request, product_id):
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return JsonResponse({"error": "Product not found"}, status=404)

    if request.method == "GET":
        images = [request.build_absolute_uri(img.image.url) for img in product.images.all() if img.image]
        thumbnail_url = request.build_absolute_uri(product.thumbnail.url) if product.thumbnail else ""
        
        reviews = list(product.reviews.values('user', 'rating', 'comment', 'created_at').order_by('-created_at'))

        data = {
            "id": product.id,
            "title": product.title,
            "description": product.description,
            "price": product.price,
            "category": product.category,
            "brand": product.brand,
            "stock": product.stock,
            "rating": product.rating,
            "thumbnail": thumbnail_url,
            "images": images,
            "reviews": reviews
        }
        return JsonResponse(data)
    
    elif request.method == "PUT":
        try:
            data = json.loads(request.body)
            product.title = data.get("title", product.title)
            product.price = data.get("price", product.price)
            product.stock = data.get("stock", product.stock)
            product.brand = data.get("brand", product.brand)
            product.category = data.get("category", product.category)
            product.description = data.get("description", product.description)
            product.save()
            return JsonResponse({"message": "Updated successfully"})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    elif request.method == "DELETE":
        product.delete()
        return JsonResponse({"message": "Deleted successfully"})

# --- 3. API รีวิว (Reviews) ---
@csrf_exempt
def api_add_review(request, product_id):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            product = Product.objects.get(id=product_id)
            
            Review.objects.create(
                product=product,
                user=data.get("name", "Anonymous"),
                rating=int(data.get("rating", 5)),
                comment=data.get("comment", "")
            )

            # Recalculate Average Rating
            avg_rating = product.reviews.aggregate(Avg('rating'))['rating__avg']
            product.rating = round(avg_rating, 1) if avg_rating else 0
            product.save()

            return JsonResponse({"message": "Review added successfully", "new_rating": product.rating})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

# --- 4. API สั่งซื้อ & ประวัติ (Order & History) ---
@csrf_exempt
def api_checkout(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            items = data.get("items", [])
            customer = data.get("customer", {})
            
            total_price = sum(item['price'] * item['quantity'] for item in items)

            with transaction.atomic():
                # Create Order
                order = Order.objects.create(
                    customer_name=customer.get('name'),
                    customer_tel=customer.get('tel'),
                    address=customer.get('address'),
                    total_price=total_price,
                    status='Processing'
                )

                # Create OrderItems & Update Stock
                for item in items:
                    product = Product.objects.select_for_update().get(id=item["id"])
                    if product.stock is not None and product.stock < item["quantity"]:
                        raise Exception(f"สินค้า {product.title} หมดหรือมีไม่พอ")
                    
                    if product.stock is not None:
                        product.stock -= item["quantity"]
                        product.save()
                    
                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        quantity=item["quantity"],
                        price=item["price"]
                    )

            return JsonResponse({"message": "Order placed successfully", "order_id": order.id})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
def api_order_history(request):
    if request.method == "GET":
        tel = request.GET.get('tel')
        if not tel:
            return JsonResponse({"error": "Phone number required"}, status=400)
        
        orders = Order.objects.filter(customer_tel=tel).order_by('-created_at')
        
        orders_data = []
        for order in orders:
            items = []
            for item in order.items.all():
                thumb = ""
                if item.product.thumbnail:
                    thumb = request.build_absolute_uri(item.product.thumbnail.url)
                
                items.append({
                    "product_title": item.product.title,
                    "quantity": item.quantity,
                    "price": item.price,
                    "thumbnail": thumb
                })
            
            orders_data.append({
                "id": order.id,
                "status": order.get_status_display(),
                "total_price": order.total_price,
                "created_at": order.created_at,
                "items": items
            })
            
        return JsonResponse({"orders": orders_data})