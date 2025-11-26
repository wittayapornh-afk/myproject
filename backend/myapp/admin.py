from django.contrib import admin
from .models import Product, ProductImage

# ลงทะเบียน Model เพื่อให้จัดการผ่านหน้า Admin ได้
admin.site.register(Product)
admin.site.register(ProductImage)