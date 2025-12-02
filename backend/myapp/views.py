from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction
from django.db.models import Avg # ✅ เพิ่ม import นี้
from django.core.files.base import ContentFile
import json
import requests
from .models import Product, ProductImage, Review

# ... (ฟังก์ชัน fetch_products และ fetch_api คงเดิม ไม่ต้องแก้) ...
def fetch_products():
    # (คงโค้ดเดิมไว้)
    pass 
def fetch_api(request):
    # (คงโค้ดเดิมไว้)
    pass

@csrf_exempt
def api_products(request):
    if request.method == "GET":
        # เริ่มต้นดึงสินค้าทั้งหมด
        products_queryset = Product.objects.all()

        # 🔍 1. กรองตามหมวดหมู่ (Category)
        category = request.GET.get('category')
        if category and category != "ทั้งหมด":
            products_queryset = products_queryset.filter(category=category)

        # 🔍 2. ค้นหา (Search)
        search = request.GET.get('search')
        if search:
            products_queryset = products_queryset.filter(title__icontains=search)

        # 🔍 3. กรองช่วงราคา (Price Range)
        min_price = request.GET.get('min_price')
        max_price = request.GET.get('max_price')
        if min_price:
            products_queryset = products_queryset.filter(price__gte=min_price)
        if max_price:
            products_queryset = products_queryset.filter(price__lte=max_price)

        # 🔃 4. เรียงลำดับ (Sort)
        sort = request.GET.get('sort')
        if sort == 'price_asc':
            products_queryset = products_queryset.order_by('price')
        elif sort == 'price_desc':
            products_queryset = products_queryset.order_by('-price')
        elif sort == 'newest':
            products_queryset = products_queryset.order_by('-id')
        else:
            products_queryset = products_queryset.order_by('-id') # Default

        # แปลงข้อมูลส่งกลับ
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
        # (คงโค้ด POST เดิมไว้)
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

        # ✅ ดึงรีวิวของสินค้านี้
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
            "reviews": reviews # ส่งรีวิวกลับไปด้วย
        }
        return JsonResponse(data)
    
    elif request.method == "PUT":
        # (คงโค้ด PUT เดิมไว้)
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

# ✅ เพิ่ม API สำหรับเขียนรีวิว
@csrf_exempt
def api_add_review(request, product_id):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            product = Product.objects.get(id=product_id)
            
            # บันทึกรีวิว
            Review.objects.create(
                product=product,
                user=data.get("name", "Anonymous"),
                rating=int(data.get("rating", 5)),
                comment=data.get("comment", "")
            )

            # คำนวณคะแนนเฉลี่ยใหม่
            avg_rating = product.reviews.aggregate(Avg('rating'))['rating__avg']
            product.rating = round(avg_rating, 1) if avg_rating else 0
            product.save()

            return JsonResponse({"message": "Review added successfully", "new_rating": product.rating})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
def api_checkout(request):
    # (คงโค้ด Checkout เดิมไว้)
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