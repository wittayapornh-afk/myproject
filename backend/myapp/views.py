from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import requests
from .models import Product, ProductImage, DeletedLog
from django.db import transaction

# --- 1. ส่วนดึงข้อมูล (Fetch API) ---
def fetch_products():
    url = "https://dummyjson.com/products?limit=30"
    response = requests.get(url)
    data = response.json()
    products_list = data.get("products", [])
    
    saved_count = 0
    for item in products_list:
        product_id = item["id"]
        if DeletedLog.objects.filter(product_id=product_id).exists(): continue 
        if Product.objects.filter(id=product_id, is_edited=True).exists(): continue

        product, created = Product.objects.update_or_create(
            id=product_id,
            defaults={
                "title": item["title"],
                "description": item["description"],
                "category": item["category"],
                "price": item["price"],
                "rating": item.get("rating", 0),
                "stock": item.get("stock", 0),
                "brand": item.get("brand", ""),
                "thumbnail": item["thumbnail"], 
            }
        )
        if not product.is_edited:
            ProductImage.objects.filter(product=product).delete()
            for img_url in item.get("images", []):
                ProductImage.objects.create(product=product, image_url=img_url)
        saved_count += 1
    return saved_count

def fetch_api(request):
    try:
        count = fetch_products()
        return HttpResponse(f"Import API success! Processed {count} products.")
    except Exception as e:
        return HttpResponse(f"Error fetching data: {str(e)}", status=500)

# --- 2. ส่วน API จัดการสินค้า ---

@csrf_exempt
def api_products(request):
    if request.method == "GET":
        products = list(Product.objects.values().order_by('-id'))
        # 👇 แก้ไขตรงนี้: เติม domain เข้าไปข้างหน้า
        base_url = "http://localhost:8000"
        
        for p in products:
            if p['image']: 
                # ถ้ามีรูปอัปโหลด ให้เติม http://localhost:8000/media/...
                p['thumbnail'] = base_url + '/media/' + p['image'] 
        
        return JsonResponse({"products": products})
    
    elif request.method == "POST":
        try:
            new_product = Product.objects.create(
                title=request.POST.get("title"),
                description=request.POST.get("description", ""),
                category=request.POST.get("category", "General"),
                price=float(request.POST.get("price", 0)),
                stock=int(request.POST.get("stock", 0)),
                brand=request.POST.get("brand", ""),
                thumbnail=request.POST.get("thumbnail", ""),
                image=request.FILES.get("image"),
                is_edited=True 
            )
            return JsonResponse({"message": "สร้างสินค้าสำเร็จ", "id": new_product.id}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
def api_product_detail(request, product_id):
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return JsonResponse({"error": "ไม่พบสินค้านี้"}, status=404)

    if request.method == "GET":
        base_url = "http://localhost:8000"
        final_image = product.thumbnail
        
        # 👇 แก้ไขตรงนี้: ถ้าเป็นไฟล์อัปโหลด ให้ใช้ full path
        if product.image:
            final_image = base_url + product.image.url
        elif product.thumbnail and not str(product.thumbnail).startswith('http'):
             # กรณีกันเหนียว ถ้า thumbnail ไม่ใช่ http ให้คิดว่าเป็น local file
             final_image = base_url + '/media/' + str(product.thumbnail)

        return JsonResponse({
            "id": product.id,
            "title": product.title,
            "description": product.description,
            "category": product.category,
            "price": product.price,
            "stock": product.stock,
            "brand": product.brand,
            "thumbnail": final_image,
            "images": [img.image_url for img in product.images.all()]
        })
    
    elif request.method == "PUT":
        try:
            data = json.loads(request.body)
            product.title = data.get("title", product.title)
            product.price = data.get("price", product.price)
            product.brand = data.get("brand", product.brand)
            product.stock = data.get("stock", product.stock)
            product.description = data.get("description", product.description)
            product.category = data.get("category", product.category)
            product.is_edited = True 
            product.save()
            return JsonResponse({"message": "อัปเดตข้อมูลสำเร็จ"})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
            
    elif request.method == "DELETE":
        DeletedLog.objects.get_or_create(product_id=product.id)
        product.delete()
        return JsonResponse({"message": "ลบสินค้าสำเร็จ"})

    return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
def api_checkout(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            items = data.get("items", [])
            with transaction.atomic():
                for item in items:
                    product = Product.objects.select_for_update().get(id=item["id"])
                    current_stock = product.stock if product.stock is not None else 0
                    if current_stock < item["quantity"]:
                        raise Exception(f"สินค้า '{product.title}' มีไม่พอ")
                    product.stock = current_stock - item["quantity"]
                    product.save()
            return JsonResponse({"message": "สั่งซื้อสำเร็จ!"})
        except Product.DoesNotExist:
            return JsonResponse({"error": "ไม่พบสินค้า"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Method not allowed"}, status=405)