from rest_framework import serializers
from .models import Product, ProductImage, Order, OrderItem, User, Coupon, FlashSale, FlashSaleProduct
from django.utils import timezone
from django.db import models


# ... (Existing ProductImageSerializer)

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image_url'] 

class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    flash_sale_info = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'title', 'price', 'description', 'stock', 'thumbnail', 'brand', 'rating', 'images', 'flash_sale_info'] # Matches model fields

    def get_flash_sale_info(self, obj):
        now = timezone.now()
        # Find active flash sale containing this product
        active_fs = FlashSaleProduct.objects.filter(
            product=obj,
            flash_sale__start_time__lte=now,
            flash_sale__end_time__gte=now,
            flash_sale__is_active=True,
            sold_count__lt=models.F('quantity_limit') # Available stock
        ).first()
        
        if active_fs:
             return {
                'id': active_fs.flash_sale.id,
                'sale_price': active_fs.sale_price,
                'end_time': active_fs.flash_sale.end_time,
                'quantity_limit': active_fs.quantity_limit,
                'sold_count': active_fs.sold_count
             }
        return None

class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = '__all__'

class FlashSaleProductSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.title')
    product_image = serializers.SerializerMethodField()
    original_price = serializers.ReadOnlyField(source='product.price')

    class Meta:
        model = FlashSaleProduct
        fields = ['id', 'product', 'product_name', 'product_image', 'sale_price', 'original_price', 'quantity_limit', 'sold_count']

    def get_product_image(self, obj):
        if obj.product.thumbnail:
            return obj.product.thumbnail.url
        return None

class FlashSaleSerializer(serializers.ModelSerializer):
    products = FlashSaleProductSerializer(many=True, read_only=True)
    status = serializers.ReadOnlyField()
    
    class Meta:
        model = FlashSale
        fields = ['id', 'name', 'start_time', 'end_time', 'is_active', 'status', 'products']

class OrderItemSerializer(serializers.ModelSerializer):
    product_title = serializers.ReadOnlyField(source='product.title') 
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_title', 'quantity', 'price_at_purchase'] 

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    class Meta:
        model = Order
        fields = ['id', 'user', 'total_price', 'status', 'created_at', 'items', 'shipping_province', 'discount_amount', 'coupon']