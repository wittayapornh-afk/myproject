from rest_framework import serializers
from .models import Product, ProductImage, Order, OrderItem

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image']

class ProductSerializer(serializers.ModelSerializer):
    # เพิ่ม field images เพื่อดึงรูปจากตาราง ProductImage ที่เชื่อมกัน
    images = ProductImageSerializer(many=True, read_only=True, source='productimage_set') 

    class Meta:
        model = Product
        # เพิ่ม 'images' เข้าไปใน fields
        fields = ['id', 'name', 'price', 'description', 'stock', 'image', 'brand', 'rating', 'images']

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True, source='orderitem_set')
    class Meta:
        model = Order
        fields = ['id', 'user', 'total_price', 'status', 'created_at', 'items']