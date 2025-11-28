from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import requests
from .models import Product, ProductImage
from django.db import transaction

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

@csrf_exempt # 1. ใส่ decorator เพื่ออนุญาตให้ส่งข้อมูลมาได้
def api_products(request):
    # กรณีขอดูรายการสินค้า (GET) - ของเดิม
    if request.method == "GET":
        products = list(Product.objects.values().order_by('-id')) # order_by('-id') เพื่อให้ของใหม่สุดขึ้นก่อน
        return JsonResponse({"products": products})

    # กรณีสร้างสินค้าใหม่ (POST) - เพิ่มใหม่
    elif request.method == "POST":
        try:
            data = json.loads(request.body)
            new_product = Product.objects.create(
                title=data.get("title"),
                description=data.get("description", ""),
                category=data.get("category", "General"),
                price=data.get("price", 0),
                rating=data.get("rating", 0),
                stock=data.get("stock", 0),
                brand=data.get("brand", ""),
                thumbnail=data.get("thumbnail", "https://cdn.dummyjson.com/product-images/1/thumbnail.jpg"), # ใส่รูป default ถ้าไม่มี
            )
            return JsonResponse({"message": "สร้างสินค้าสำเร็จ", "id": new_product.id}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
@csrf_exempt
def api_checkout(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            items = data.get("items", [])

            # ใช้ transaction.atomic เพื่อความชัวร์ (ตัดต้องตัดให้ครบ ถ้าพังให้ยกเลิกหมด)
            with transaction.atomic():
                for item in items:
                    # ดึงสินค้าตัวจริงจาก Database (พร้อมล็อกไม่ให้คนอื่นแย่งซื้อตัดหน้า)
                    product = Product.objects.select_for_update().get(id=item["id"])
                    
                    # เช็คสต็อก
                    current_stock = product.stock if product.stock is not None else 0
                    if current_stock < item["quantity"]:
                        raise Exception(f"สินค้า '{product.title}' มีไม่พอ (เหลือ {current_stock})")
                    
                    # ตัดสต็อก
                    product.stock = current_stock - item["quantity"]
                    product.save()

            return JsonResponse({"message": "สั่งซื้อสำเร็จ! ตัดสต็อกเรียบร้อย"})
        
        except Product.DoesNotExist:
            return JsonResponse({"error": "ไม่พบสินค้าในระบบ"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    
    return JsonResponse({"error": "Method not allowed"}, status=405)