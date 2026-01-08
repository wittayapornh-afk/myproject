from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from myapp import views

urlpatterns = [
    # --- Auth & Profile (ระบบสมาชิกและการเข้าสู่ระบบ) ---
    path('api/login/', views.login_api, name='login_api'),
    path('api/register/', views.register_api, name='register_api'),
    path('api/logout/', views.logout_api, name='logout_api'),
    path('api/profile/', views.user_profile_api, name='user_profile'),

    # --- Admin: User Management (การจัดการผู้ใช้งาน) ---
    path('api/admin/users/', views.get_all_users, name='get_all_users'),
    path('api/admin/users/role/', views.manage_user_role, name='manage_user_role'),
    path('api/admin/users/<int:user_id>/delete/', views.delete_user_api, name='delete_user'),
    path('api/update-user/<int:user_id>/', views.admin_update_user_api, name='admin_update_user'),

    # --- Admin: Dashboard & Lists (หน้า Dashboard ของผู้ดูแล) ---
    path('api/admin/products/', views.admin_products_list, name='admin_products_list'),
    path('api/admin/orders/', views.admin_orders_list, name='admin_orders'), 
    path('api/admin-stats/', views.get_admin_stats, name='admin_stats_api'),
    path('api/admin-logs/', views.get_admin_logs, name='get_admin_logs'),

    # --- Products (ระบบสินค้าและหมวดหมู่) ---
    path('api/products/', views.products_api, name='products_api'),
    path('api/products/add/', views.add_product_api, name='add_product'),
    path('api/products/<int:product_id>/', views.product_detail_api, name='product_detail_api'),
    path('api/products/<int:product_id>/edit/', views.edit_product_api, name='edit_product'),
    path('api/products/<int:product_id>/delete/', views.delete_product_api, name='delete_product'),
    path('api/categories/', views.categories_api, name='categories_api'),
    path('api/categories-list/', views.category_list_api, name='category_list_api'), # ✅ สำหรับ Dropdown List
    
    # ✅ เพิ่มเติม: เส้นทางสำหรับรีวิวสินค้า (แก้ปัญหาบัครีวิวไม่ขึ้น)
    path('api/products/<int:product_id>/review/', views.add_review_api, name='add_review'),

    # --- Orders & Checkout (ระบบสั่งซื้อและประวัติการสั่งซื้อ) ---
    path('api/checkout/', views.checkout, name='checkout'),
    path('api/my-orders/', views.my_orders_api, name='my_orders'), # ✅ ใช้ตัวเดียวที่นี่
    path('api/orders/create/', views.create_order, name='create_order'),
    path('api/orders/<int:order_id>/update/', views.update_order_status, name='update_order'),
    path('api/users/', views.get_all_users),

    # --- Django Standard Admin ---
    path('admin/', admin.site.urls),
]

# รองรับการเปิดไฟล์รูปภาพในโหมดพัฒนา (Debug Mode)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)