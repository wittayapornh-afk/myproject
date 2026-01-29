from rest_framework import serializers
from .models import Product, ProductImage, Order, OrderItem, User, Coupon, FlashSale, FlashSaleProduct, FlashSaleCampaign
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
    category = serializers.StringRelatedField() # ✅ Return Category Name instead of ID

    class Meta:
        model = Product
        fields = ['id', 'title', 'price', 'description', 'stock', 'thumbnail', 'brand', 'rating', 'images', 'flash_sale_info', 'category'] # Matches model fields

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
        fields = ['id', 'code', 'discount_type', 'discount_value', 'min_spend', 'usage_limit', 'total_supply', 'used_count', 'start_date', 'end_date', 'active', 'limit_per_user', 'limit_per_user_per_day', 'allowed_roles', 'target_user_roles', 'max_discount_amount', 'is_stackable_with_flash_sale', 'auto_apply', 'is_public', 'conditions', 'tiered_rules', 'priority']

class FlashSaleProductSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.title')
    product_image = serializers.SerializerMethodField()
    original_price = serializers.ReadOnlyField(source='product.price')

    class Meta:
        model = FlashSaleProduct
        fields = ['id', 'product', 'product_name', 'product_image', 'sale_price', 'original_price', 'quantity_limit', 'sold_count', 'limit_per_user']

    def get_product_image(self, obj):
        if obj.product.thumbnail:
            return obj.product.thumbnail.url
        return None

# ==========================================
# 🎯 Flash Sale Campaign Serializer
# ==========================================
class FlashSaleCampaignSerializer(serializers.ModelSerializer):
    """
    Serializer สำหรับ Flash Sale Campaign
    
    ใช้สำหรับ:
    - Campaign Batch View (แสดงรายการแคมเปญ)
    - Campaign Form (สร้าง/แก้ไข)
    """
    # ✅ เพิ่ม computed fields
    flash_sale_count = serializers.IntegerField(read_only=True, source='flash_sales.count')
    status = serializers.CharField(read_only=True)
    
    # ✅ เพิ่ม nested Flash Sales data (สำหรับ Campaign Detail View)
    flash_sales = serializers.SerializerMethodField()
    
    def get_flash_sales(self, obj):
        """ดึงข้อมูล Flash Sales ทั้งหมดที่เข้าร่วม Campaign พร้อม Products"""
        from .models import FlashSale
        sales = FlashSale.objects.filter(campaign=obj).order_by('start_time')
        return FlashSaleSerializer(sales, many=True).data
    
    class Meta:
        model = FlashSaleCampaign
        fields = [
            'id', 'name', 'description', 
            'campaign_start', 'campaign_end',
            'banner_image', 'theme_color',
            'is_active', 'priority',
            'flash_sale_count', 'status',  # Computed
            'flash_sales',  # Nested
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class FlashSaleSerializer(serializers.ModelSerializer):
    """
    Serializer สำหรับ Flash Sale
    
    ✅ เพิ่ม Timeline data สำหรับ Visual Timeline View
    """
    products = FlashSaleProductSerializer(many=True, read_only=True)
    status = serializers.ReadOnlyField()
    
    # ✅ NEW: Timeline positioning data
    duration_hours = serializers.FloatField(read_only=True)
    timeline_position_percent = serializers.FloatField(read_only=True)
    timeline_width_percent = serializers.FloatField(read_only=True)
    timeline_color = serializers.SerializerMethodField()
    
    # ✅ Campaign info (nested)
    campaign_name = serializers.CharField(source='campaign.name', read_only=True, allow_null=True)
    
    class Meta:
        model = FlashSale
        fields = [
            'id', 'name', 'description', 'banner_image', 
            'start_time', 'end_time', 
            'is_active', 'status', 'products',
            
            # Campaign link
            'campaign', 'campaign_name', 'display_order',
            
            # Timeline data (for Visual Timeline View)
            'duration_hours', 'timeline_position_percent', 
            'timeline_width_percent', 'timeline_color',
            
            # Feature Flags
            'show_in_hero', 'enable_notification', 'auto_disable_on_end', 
            'limit_per_user_enabled', 'show_countdown_timer'
        ]
    
    def get_timeline_color(self, obj):
        """ดึงสีจาก helper method ใน Model"""
        return obj.get_timeline_color()

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