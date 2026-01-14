from django.contrib import admin
from django.urls import path
from rest_framework.authtoken import views as token_views
from django.conf import settings
from django.conf.urls.static import static
from myapp import views

urlpatterns = [
    # --- Auth (ระบบสมาชิก) --
    path('api/login/', views.login_api, name='api_token_auth'),
    path('api/register/', views.register_api, name='register_api'),
    path('api/logout/', views.logout_api, name='logout_api'),
    path('api/profile/', views.user_profile_api, name='user_profile'),

    # --- Admin Users & Role ---
    path('api/admin/users/', views.get_all_users, name='get_all_users'),
    path('api/admin/users/role/', views.manage_user_role, name='manage_user_role'),
    path('api/admin/users/<int:user_id>/delete/', views.delete_user_api, name='delete_user'),
    path('api/update-user/<int:user_id>/', views.admin_update_user_api, name='admin_update_user'), # ✅ Simplified

    # --- Admin Dashboard Lists ---
    path('api/admin/products/', views.admin_products_list, name='admin_products_list'),
    
    # ✅ แก้ไข 1: เพิ่ม api/ ให้ลิงก์นี้
    path('api/admin/orders/', views.admin_orders_list, name='admin_orders'), 

    # --- Products (สินค้า) ---
    path('api/products/', views.products_api, name='products_api'),
    path('api/products/add/', views.add_product_api, name='add_product'),
    path('api/products/<int:product_id>/', views.product_detail_api, name='product_detail_api'),
    path('api/products/<int:product_id>/related/', views.get_related_products, name='get_related_products'),
    path('api/products/<int:product_id>/stock-history/', views.get_stock_history, name='get_stock_history'),
    path('api/products/<int:product_id>/edit/', views.edit_product_api, name='edit_product'),
    path('api/products/<int:product_id>/delete/', views.delete_product_api, name='delete_product'),
    
    path('api/categories/', views.categories_api, name='categories_api'),
    path('api/admin/categories-list/', views.get_categories, name='get_categories_list'), # ✅ New Endpoint for Dropdown
    path('api/brands/', views.brands_api, name='brands_api'),
    path('api/submit-review/', views.submit_review, name='submit_review'),

    # --- Orders & Checkout (สั่งซื้อ) ---
    # ✅ แก้ไข 2: เพิ่ม api/ ให้ลิงก์ checkout (สำคัญมาก!)
    path('api/checkout/', views.checkout_api, name='checkout'), 
    
    path('api/orders/create/', views.create_order, name='create_order'),
    path('api/orders/<int:order_id>/update/', views.update_order_status, name='update_order'),
    path('api/orders/<int:order_id>/confirm-received/', views.confirm_received_api, name='confirm_received'), # ✅ New Endpoint
    
    # ✅ แก้ไข 3: ใช้ path นี้อันเดียวสำหรับประวัติการสั่งซื้อ
    path('api/my-orders/', views.my_orders_api, name='my_orders'),

    # --- Admin Stats & Logs ---
    path('api/admin-stats/', views.get_admin_stats, name='admin_stats_api'),
    path('api/admin-logs/', views.get_admin_logs, name='get_admin_logs'),
    
    # --- Django Admin ---
    path('admin/', admin.site.urls),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)