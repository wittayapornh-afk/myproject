# backend/myapp/serializers.py
from rest_framework import serializers
from .models import Product, ProductImage, Order, OrderItem, User

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image']

class ProductSerializer(serializers.ModelSerializer):
    # เพิ่มบรรทัดนี้เพื่อดึงรูปภาพย่อยทั้งหมดมาแสดง
    images = ProductImageSerializer(many=True, read_only=True) 

    class Meta:
        model = Product
        fields = '__all__' # หรือระบุ fields รวมถึง 'images' ด้วย

# Serializer สำหรับ Order
class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'

# Serializer สำหรับ User management
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff', 'is_superuser']