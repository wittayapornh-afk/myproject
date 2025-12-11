from django.contrib import admin
from .models import Product, ProductImage, Order, OrderItem, Review, UserProfile, AdminLog

# แสดงรายการ OrderItem ซ้อนในหน้า Order
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer_name', 'total_price', 'status', 'created_at', 'payment_slip']
    list_filter = ['status', 'created_at']
    inlines = [OrderItemInline]
    search_fields = ['id', 'customer_name', 'customer_tel']

class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'role', 'phone']
    list_filter = ['role']
    search_fields = ['user__username', 'phone']

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

class ProductAdmin(admin.ModelAdmin):
    inlines = [ProductImageInline]
    list_display = ['title', 'category', 'price', 'stock', 'is_active']
    list_filter = ['category', 'is_active']
    search_fields = ['title']

admin.site.register(Product, ProductAdmin)
admin.site.register(Order, OrderAdmin)
admin.site.register(UserProfile, UserProfileAdmin)
admin.site.register(Review)
admin.site.register(AdminLog)