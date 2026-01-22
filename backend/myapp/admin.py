from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Product, ProductImage, Order, OrderItem, Review, AdminLog, FlashSale, FlashSaleCampaign

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer_name', 'total_price', 'status', 'created_at', 'payment_slip']
    list_filter = ['status', 'created_at']
    inlines = [OrderItemInline]
    search_fields = ['id', 'customer_name', 'customer_tel']

# Custom User Admin to show role/phone
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'role', 'phone', 'is_active', 'is_staff', 'is_superuser']
    list_filter = ['role', 'is_active']
    search_fields = ['username', 'email', 'phone']
    
    # Add custom fields to edit page
    fieldsets = UserAdmin.fieldsets + (
        ('Extra Info', {'fields': ('role', 'phone', 'address', 'image')}),
    )

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

class ProductAdmin(admin.ModelAdmin):
    inlines = [ProductImageInline]
    list_display = ['title', 'category', 'price', 'stock', 'is_active']
    list_filter = ['category', 'is_active']
    search_fields = ['title']

# ==========================================
# 🎯 Flash Sale Campaign Admin
# ==========================================
class FlashSaleCampaignAdmin(admin.ModelAdmin):
    """
    Admin interface สำหรับจัดการ Flash Sale Campaign
    """
    list_display = ['name', 'campaign_start', 'campaign_end', 'status', 'flash_sale_count', 'is_active', 'priority']
    list_filter = ['is_active', 'campaign_start']
    search_fields = ['name', 'description']
    ordering = ['-campaign_start', '-priority']
    
    # ฟิลด์ที่แสดงในฟอร์ม
    fieldsets = (
        ('ข้อมูลพื้นฐาน', {
            'fields': ('name', 'description', 'theme_color')
        }),
        ('ช่วงเวลา', {
            'fields': ('campaign_start', 'campaign_end')
        }),
        ('การตั้งค่า', {
            'fields': ('banner_image', 'is_active', 'priority')
        }),
    )

class FlashSaleAdmin(admin.ModelAdmin):
    """
    Admin interface สำหรับจัดการ Flash Sale
    """
    list_display = ['name', 'campaign', 'start_time', 'end_time', 'status', 'is_active', 'display_order']
    list_filter = ['is_active', 'campaign', 'start_time']
    search_fields = ['name', 'description']
    ordering = ['-start_time', 'display_order']
    
    # ฟิลด์ที่แสดงในฟอร์ม
    fieldsets = (
        ('ข้อมูลพื้นฐาน', {
            'fields': ('name', 'description', 'campaign', 'display_order')
        }),
        ('ช่วงเวลา', {
            'fields': ('start_time', 'end_time')
        }),
        ('การตั้งค่า', {
            'fields': ('banner_image', 'is_active', 'priority')
        }),
        ('Feature Flags', {
            'fields': ('show_in_hero', 'enable_notification', 'show_countdown_timer'),
            'classes': ('collapse',)  # ซ่อนได้
        }),
    )

# Register updated models
admin.site.register(User, CustomUserAdmin)
admin.site.register(Product, ProductAdmin)
admin.site.register(Order, OrderAdmin)
admin.site.register(Review)
admin.site.register(AdminLog)
admin.site.register(FlashSaleCampaign, FlashSaleCampaignAdmin)  # ✅ New
admin.site.register(FlashSale, FlashSaleAdmin)  # ✅ New