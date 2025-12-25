from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Product, ProductImage, Order, OrderItem, Review, AdminLog

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

# Register updated models
admin.site.register(User, CustomUserAdmin)
admin.site.register(Product, ProductAdmin)
admin.site.register(Order, OrderAdmin)
admin.site.register(Review)
admin.site.register(AdminLog)