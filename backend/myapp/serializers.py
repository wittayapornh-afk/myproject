from rest_framework import serializers
from .models import Product, ProductImage, Category

# ✅ 1. เพิ่ม Class นี้ไว้ด้านบน (ถ้ายังไม่มี)
class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image']

class ProductSerializer(serializers.ModelSerializer):
    # ✅ 2. เพิ่มบรรทัดนี้ เพื่อดึงรูป Gallery ออกมาด้วย
    images = ProductImageSerializer(many=True, read_only=True) 
    
    class Meta:
        model = Product
        # ✅ 3. อย่าลืมเติม 'images' เข้าไปใน fields
        fields = ['id', 'title', 'description', 'price', 'thumbnail', 'stock', 'category', 'brand', 'rating', 'images']