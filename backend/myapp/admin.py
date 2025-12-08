from django.contrib import admin
from .models import Product, ProductImage, Review, Order, OrderItem # ✅ เพิ่ม Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer_name', 'customer_tel', 'total_price', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    inlines = [OrderItemInline]

admin.site.register(Product)
admin.site.register(ProductImage)
admin.site.register(Review)
admin.site.register(Order, OrderAdmin) # ✅ Register