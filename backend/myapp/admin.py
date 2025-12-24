from django.contrib import admin
from .models import Product, ProductImage, Order, OrderItem, Review, UserProfile, ActivityLog

# 1. Product & Gallery
class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

class ProductAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'price', 'stock', 'category', 'is_active']
    search_fields = ['title', 'category']
    list_filter = ['category', 'is_active']
    inlines = [ProductImageInline]

# 2. Order & Items
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

class OrderAdmin(admin.ModelAdmin):
    # เอา payment_slip ออก เพื่อแก้ Error Server พัง
    list_display = ['id', 'user', 'total_price', 'status', 'created_at', 'payment_method']
    list_filter = ['status', 'created_at']
    inlines = [OrderItemInline]

# 3. Activity Log
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ['timestamp', 'user', 'action', 'target']
    list_filter = ['action', 'timestamp']
    ordering = ('-timestamp',)

# Register Models
admin.site.register(Product, ProductAdmin)
admin.site.register(Order, OrderAdmin)
admin.site.register(Review)
admin.site.register(UserProfile)
admin.site.register(ActivityLog, ActivityLogAdmin)
# admin.site.register(ProductImage) # ไม่ต้องแยกเพราะอยู่ใน Product แล้ว
# admin.site.register(OrderItem)    # ไม่ต้องแยกเพราะอยู่ใน Order แล้ว