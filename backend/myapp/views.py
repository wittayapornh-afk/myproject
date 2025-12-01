from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction
import json
import requests
from .models import Product, ProductImage

# ... (ฟังก์ชัน fetch_api และ fetch_products คงเดิม ไม่ต้องแก้) ...
def fetch_products():
    url = "https://dummyjson.com/products?limit=30"
    response = requests.get(url)
    data = response.json()
    products_list = data.get("products", [])
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
                "thumbnail": item["thumbnail"],
            }
        )
        ProductImage.objects.filter(product=product).delete()
        for img_url in item.get("images", []):
            ProductImage.objects.create(product=product, image_url=img_url)
    return len(products_list)

def fetch_api(request):
    count = fetch_products()
    return HttpResponse(f"Import API success! Saved {count} products.")

@csrf_exempt
def api_products(request):
    if request.method == "GET":
        products = list(Product.objects.values().order_by('-id'))
        return JsonResponse({"products": products})

    elif request.method == "POST":
        try:
            data = json.loads(request.body)
            default_image = "https://placehold.co/600x600/305949/ffffff?text=Product"
            
            # สร้างสินค้าหลัก
            new_product = Product.objects.create(
                title=data.get("title"),
                description=data.get("description", ""),
                category=data.get("category", "General"),
                price=data.get("price", 0),
                rating=data.get("rating", 0),
                stock=data.get("stock", 0),
                brand=data.get("brand", ""),
                thumbnail=data.get("thumbnail") or default_image,
            )

            # ✅ เพิ่มส่วนนี้: บันทึกรูปภาพเพิ่มเติม (Gallery)
            gallery_images = data.get("images", []) # รับเป็น List
            for img_url in gallery_images:
                ProductImage.objects.create(product=new_product, image_url=img_url)

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
        # ดึงรูปทั้งหมดส่งกลับไป
        images = list(product.images.values_list('image_url', flat=True))
        data = {
            "id": product.id,
            "title": product.title,
            "description": product.description,
            "price": product.price,
            "category": product.category,
            "brand": product.brand,
            "stock": product.stock,
            "thumbnail": product.thumbnail,
            "images": images # ส่ง list รูปกลับไป
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
            product.thumbnail = data.get("thumbnail", product.thumbnail)
            product.save()

            # ✅ เพิ่มส่วนนี้: อัปเดตรูปภาพ Gallery (ลบของเก่าลงใหม่เพื่อง่ายต่อการจัดการ)
            gallery_images = data.get("images", None)
            if gallery_images is not None:
                ProductImage.objects.filter(product=product).delete() # ล้างรูปเก่า
                for img_url in gallery_images:
                    ProductImage.objects.create(product=product, image_url=img_url)

            return JsonResponse({"message": "Updated successfully"})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    elif request.method == "DELETE":
        product.delete()
        return JsonResponse({"message": "Deleted successfully"})

@csrf_exempt
def api_checkout(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            items = data.get("items", [])
            with transaction.atomic():
                for item in items:
                    product = Product.objects.select_for_update().get(id=item["id"])
                    if product.stock is not None and product.stock < item["quantity"]:
                        raise Exception(f"สินค้า {product.title} หมดหรือมีไม่พอ")
                    if product.stock is not None:
                        product.stock -= item["quantity"]
                        product.save()
            return JsonResponse({"message": "Order placed successfully"})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)