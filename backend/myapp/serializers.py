from rest_framework import serializers
from .models import Product, ProductImage, Order, OrderItem, User, Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image_url'] # Matches model field

class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    # Read-only string for backward compatibility (Front-end display)
    category = serializers.ReadOnlyField(source='cat_id.name') 
    # Writable ID for forms
    cat_id = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), required=False, allow_null=True)

    class Meta:
        model = Product
        fields = ['id', 'title', 'price', 'description', 'stock', 'thumbnail', 'brand', 'rating', 'images', 'category', 'cat_id'] # Matches model fields

class OrderItemSerializer(serializers.ModelSerializer):
    product_title = serializers.ReadOnlyField(source='product.title') # Changed from name to title
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_title', 'quantity', 'price_at_purchase'] # Matches model field

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    class Meta:
        model = Order
        fields = ['id', 'user', 'total_price', 'status', 'created_at', 'items']