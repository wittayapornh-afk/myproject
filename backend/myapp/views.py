from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, JsonResponse
import requests
from .models import Product, ProductImage


def api_product_detail(request, product_id):
    product = get_object_or_404(Product, id=product_id)
# ฟังก์ชันดึงข้อมูลจาก DummyJSON มาเก็บลง Database
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
                "rating": item["rating"],
                "stock": item["stock"],
                "brand": item.get("brand", ""),
                "thumbnail": item["thumbnail"],
            }
        )
        
        # ลบรูปเก่าแล้วบันทึกใหม่
        ProductImage.objects.filter(product=product).delete()
        for img_url in item.get("images", []):
            ProductImage.objects.create(product=product, image_url=img_url)

    return len(products_list)

# View สำหรับเรียกใช้งาน Trigger การดึงข้อมูล
def fetch_api(request):
    count = fetch_products()
    return HttpResponse(f"Import API success! Saved {count} products.")

# API สำหรับส่งข้อมูลให้ Frontend
def api_products(request):
    products = list(Product.objects.values())
    return JsonResponse({"products": products})

def api_product_detail(request, product_id):
    # ตอนนี้คำสั่งนี้จะทำงานได้แล้ว เพราะเรา import มาแล้ว
    product = get_object_or_404(Product, id=product_id)
    
    images = [img.image_url for img in product.images.all()]
    
    data = {
        "id": product.id,
        "title": product.title,
        "description": product.description,
        "category": product.category,
        "price": product.price,
        "rating": product.rating,
        "stock": product.stock,
        "brand": product.brand,
        "thumbnail": product.thumbnail,
        "images": images,
    }
    return JsonResponse(data)