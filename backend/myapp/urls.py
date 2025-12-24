from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from myapp import views  # ✅ ตรวจสอบว่าชื่อโฟลเดอร์แอพคือ 'myapp' ถ้าไม่ใช่ให้แก้ตรงนี้

urlpatterns = [
    # --- Admin Django (หน้าจัดการของระบบ) ---
    path('admin/', admin.site.urls),
    
    # ===========================================
    # 🔐 Authentication (ระบบสมาชิก)
    # ===========================================
    path('api/register/', views.register_api),
    path('api/login/', views.login_api),
    path('api/logout/', views.logout_api),
    path('api/profile/', views.user_profile_api),
    
    # ===========================================
    # 🛒 Products (สินค้าหน้าบ้าน)
    # ===========================================
    path('api/products/', views.products_api),
    path('api/products/<int:product_id>/', views.product_detail_api),
    path('api/categories/', views.categories_api),
    
    # ===========================================
    # 💳 Checkout & Orders (สั่งซื้อ) ✅ จุดที่แก้
    # ===========================================
    # ใช้ checkout_api ตามที่แก้ใน views.py ล่าสุด
    path('api/checkout/', views.checkout_api, name='checkout_api'), 
    path('api/my-orders/', views.my_orders_api),
    path('api/admin/stats/', views.get_admin_stats),          # กราฟและสถิติ
    path('api/admin/products/', views.admin_products_list),   # รายการสินค้า (Admin)
    path('api/admin/orders/', views.admin_orders_list),       # รายการออเดอร์
    path('api/admin/orders/<int:oid>/status/', views.update_order_status), # เปลี่ยนสถานะออเดอร์
    path('api/admin/users/', views.get_all_users),            # รายชื่อ User
    path('api/admin/users/role/', views.manage_user_role),

    # ===========================================
    # 🔧 Admin API (ระบบหลังบ้าน Custom)
    # ===========================================
    path('api/admin/stats/', views.get_admin_stats),
    path('api/admin/products/', views.admin_products_list),
    path('api/admin/product/add/', views.add_product_api),
    path('api/admin/product/<int:product_id>/edit/', views.edit_product_api),
    path('api/admin/product/<int:product_id>/delete/', views.delete_product_api),
    
    path('api/admin/orders/', views.admin_orders_list),
    path('api/admin/orders/<int:order_id>/status/', views.update_order_status),
    
    path('api/admin/users/', views.get_all_users),
    path('api/admin/users/role/', views.manage_user_role),
    path('api/admin/logs/', views.get_admin_logs),
]

# ===========================================
# 🖼️ Media Files (สำหรับโหลดรูปภาพ)
# ===========================================
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

class Review(models.Model):
    product = models.ForeignKey(Product, related_name='reviews', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField(default=5)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    # สำหรับการตอบกลับ (Reply) ถ้าเป็น null คือคอมเมนต์หลัก
    parent = models.ForeignKey('self', null=True, blank=True, related_name='replies', on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user.username} - {self.product.title}"