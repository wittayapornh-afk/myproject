from django.shortcuts import render, redirect
from myapp.models import Person
import requests
from .models import Product, ProductImage
from django.http import HttpResponse
from .models import Product, ProductImage

def fetch_products():
    url = "https://dummyjson.com/products/1"   # เปลี่ยนเป็น /products?limit=100 ได้
    data = requests.get(url).json()

    product, created = Product.objects.update_or_create(
        id=data["id"],
        defaults={
            "title": data["title"],
            "description": data["description"],
            "category": data["category"],
            "price": data["price"],
            "discount": data["discountPercentage"],
            "rating": data["rating"],
            "stock": data["stock"],
            "brand": data["brand"],
            "thumbnail": data["thumbnail"],
        }
    )

    # เก็บรูป images
    ProductImage.objects.filter(product=product).delete()
    for img in data["images"]:
        ProductImage.objects.create(product=product, image_url=img)

    return product



def fetch_api(request):
    fetch_products()
    return HttpResponse("Import API success!")
from django.shortcuts import render
from .models import Product

def api_products(request):
    products = list(Product.objects.values())
    return JsonResponse({"products": products})
