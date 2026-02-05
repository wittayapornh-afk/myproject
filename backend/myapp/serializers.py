from rest_framework import serializers
from .models import Product, ProductImage, Order, OrderItem, User, Coupon, FlashSale, FlashSaleProduct, FlashSaleCampaign, Tag, Category, Wishlist, Notification
from django.utils import timezone
from django.db import models


# ... (Existing ProductImageSerializer)

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image_url']

# ==========================================
# 🍌 Mega Menu Config Serializer
# ==========================================
class MegaMenuConfigSerializer(serializers.ModelSerializer):
    class Meta:
        from .models_menu import MegaMenuConfig
        model = MegaMenuConfig
        fields = ['banner_image', 'promo_text', 'button_text', 'button_link', 'is_featured']

class CategorySerializer(serializers.ModelSerializer):
    menu_config = MegaMenuConfigSerializer(read_only=True)
    product_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'menu_config', 'product_count']

class TagSerializer(serializers.ModelSerializer):
    """
    Serializer สำหรับ Tag
    
    ใช้สำหรับ:
    - แสดงรายการ Tags ทั้งหมด
    - สร้าง Tag ใหม่
    - แสดง Tags ที่เชื่อมกับสินค้า
    """
    product_count = serializers.SerializerMethodField(read_only=True)
    product_thumbnails = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Tag
        fields = ['id', 'name', 'group_name', 'color', 'icon', 'product_count', 'product_thumbnails', 'expiration_date', 'automation_rules', 'is_active']
    
    def get_product_count(self, obj):
        """นับจำนวนสินค้าที่มี Tag นี้"""
        return obj.products.count() 

    def get_product_thumbnails(self, obj):
        """ดึงรูปของสินค้า 3 อันแรกที่ติด Tag นี้"""
        products = obj.products.all()[:3]
        return [p.thumbnail.url if p.thumbnail else None for p in products]

class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    flash_sale_info = serializers.SerializerMethodField()
    category = serializers.StringRelatedField() # ✅ Return Category Name instead of ID
    tags = TagSerializer(many=True, read_only=True) # ✅ แสดง Tags ที่เชื่อมกับสินค้า

    class Meta:
        model = Product
        fields = ['id', 'title', 'price', 'description', 'stock', 'thumbnail', 'brand', 'rating', 'images', 'flash_sale_info', 'category', 'tags', 'created_at'] # ✅ เพิ่ม tags, created_at

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
    stock = serializers.ReadOnlyField(source='product.stock') # ✅ Expose Stock for Validation
    product_tags = TagSerializer(source='product.tags', many=True, read_only=True)

    class Meta:
        model = FlashSaleProduct
        fields = ['id', 'product', 'product_name', 'product_image', 'sale_price', 'original_price', 'stock', 'quantity_limit', 'sold_count', 'limit_per_user', 'product_tags']

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
        fields = ['id', 'user', 'total_price', 'status', 'created_at', 'items', 'shipping_province', 'discount_amount', 'coupon', 'processing_at', 'shipped_at', 'completed_at', 'cancelled_at']
# =========================================
#  Wishlist Serializer
# =========================================

class WishlistSerializer(serializers.ModelSerializer):
    product_id = serializers.ReadOnlyField(source='product.id')
    product_title = serializers.ReadOnlyField(source='product.title')
    product_image = serializers.SerializerMethodField()
    current_price = serializers.ReadOnlyField(source='product.price')
    stock = serializers.ReadOnlyField(source='product.stock')
    in_stock = serializers.SerializerMethodField()
    price_dropped = serializers.SerializerMethodField()
    price_drop_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Wishlist
        fields = ['id', 'product_id', 'product_title', 'product_image', 'initial_price', 'current_price', 'stock', 'in_stock', 'price_dropped', 'price_drop_percentage', 'added_date', 'notify_on_drop']

    def get_product_image(self, obj):
        if obj.product.thumbnail:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.product.thumbnail.url)
            return obj.product.thumbnail.url
        return None

    def get_in_stock(self, obj):
        return obj.product.stock > 0

    def get_price_dropped(self, obj):
        return obj.price_dropped

    def get_price_drop_percentage(self, obj):
        return round(obj.price_drop_percentage, 2)

class NotificationSerializer(serializers.ModelSerializer):
    created_at_formatted = serializers.SerializerMethodField()
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'type', 'is_read', 'created_at', 'created_at_formatted', 'related_id', 'image_url']
    
    def get_created_at_formatted(self, obj):
        return obj.created_at.strftime("%d/%m/%Y %H:%M")

class ShippingAddressSerializer(serializers.ModelSerializer):
    class Meta:
        from .models import ShippingAddress
        model = ShippingAddress
        fields = ['id', 'receiver_name', 'phone', 'address_detail', 'sub_district', 'district', 'province', 'zipcode', 'label', 'is_default', 'latitude', 'longitude']
        read_only_fields = ['id', 'user']
