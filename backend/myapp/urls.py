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
    path('api/change-password/', views.change_password_api, name='change_password_api'),

    # --- Admin Users & Role ---
    path('api/admin/users/', views.get_all_users, name='get_all_users'),
    path('api/admin/users/create/', views.create_system_user, name='create_system_user'), # ✅ New API
    path('api/admin/users/role/', views.manage_user_role, name='manage_user_role'),
    path('api/admin/users/<int:user_id>/delete/', views.delete_user_api, name='delete_user'),
    path('api/update-user/<int:user_id>/', views.admin_update_user_api, name='admin_update_user'), # ✅ Simplified

    # --- Admin Dashboard Lists ---
    path('api/admin/products/', views.admin_products_list, name='admin_products_list'),
    path('api/public/products-dropdown/', views.get_all_products_simple, name='get_all_products_simple'), # ✅ Renamed to Public
    
    # ✅ แก้ไข 1: เพิ่ม api/ ให้ลิงก์นี้
    # --- Admin Orders ---

    path('api/admin/orders/', views.get_admin_orders, name='admin_orders'), 
    path('api/admin/orders_v2/', views.admin_orders_api_v4, name='admin_orders_v2'), # ✅ Added v2
    path('api/admin/orders/bulk-update/', views.bulk_update_orders_api, name='bulk_update_orders'),
    path('api/admin/order/<int:order_id>/delete/', views.delete_order_api, name='delete_order'), 

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
    
    # --- Tags (🏷️ Tag System) ---
    path('api/tags/', views.tag_api, name='tags_api'),  # GET: ดึง Tags ทั้งหมด, POST: สร้าง Tag ใหม่
    path('api/tags/<int:tag_id>/', views.tag_api, name='tag_detail'),  # DELETE: ลบ Tag
    path('api/products/<int:product_id>/tags/', views.product_tags_api, name='product_tags'),  # POST: กำหนด Tags ให้สินค้า
    
    path('api/submit-review/', views.submit_review, name='submit_review'),

    # --- Orders & Checkout (สั่งซื้อ) ---
    # ✅ แก้ไข 2: เพิ่ม api/ ให้ลิงก์ checkout (สำคัญมาก!)
    path('api/checkout/', views.checkout_api, name='checkout'), 
    path('api/upload_slip/<int:order_id>/', views.upload_slip_api, name='upload_slip'), 
    path('api/payment/promptpay_payload/', views.generate_promptpay_qr_api, name='promptpay_payload'), # ✅ Renamed to avoid alias conflict
    
    path('api/orders/create/', views.create_order, name='create_order'),
    path('api/orders/<int:order_id>/update/', views.update_order_status, name='update_order'),
    path('api/orders/<int:order_id>/confirm-received/', views.confirm_received_api, name='confirm_received'), # ✅ New Endpoint
    
    # ✅ แก้ไข 3: ใช้ path นี้อันเดียวสำหรับประวัติการสั่งซื้อ
    path('api/my-orders/', views.my_orders_api, name='my_orders'),

    # --- Admin Stats & Logs ---
    path('api/admin-stats/', views.get_admin_stats, name='admin_stats_api'),
    path('api/admin/logs/', views.get_admin_logs, name='get_admin_logs'),

    # --- Flash Sales ---
    path('api/admin/flash-sales/', views.admin_flash_sale_api, name='admin_flash_sale'),
    path('api/admin/flash-sales/<int:fs_id>/', views.admin_flash_sale_api, name='admin_flash_sale_detail'),
    path('api/flash-sales/active/', views.get_active_flash_sales_api, name='active_flash_sales'),
    
    # ✅ NEW: Flash Sale Campaigns
    path('api/admin/campaigns/', views.admin_campaign_api, name='admin_campaign'),
    path('api/admin/campaigns/<int:campaign_id>/', views.admin_campaign_api, name='admin_campaign_detail'),
    path('api/admin/campaigns/<int:campaign_id>/flash-sales/', views.get_campaign_flash_sales, name='campaign_flash_sales'),

    # --- Coupons ---
    path('api/admin/coupons/', views.admin_coupon_api, name='admin_coupon'),
    path('api/admin/coupons/<int:coupon_id>/', views.admin_coupon_api, name='admin_coupon_detail'),
    path('api/coupons/validate/', views.validate_coupon_api, name='validate_coupon'),
    path('api/coupons-public/', views.get_public_coupons, name='public_coupons'),
    
    # ✅ Coupon Collection System
    path('api/coupons/<int:coupon_id>/collect/', views.collect_coupon_api, name='collect_coupon'),
    path('api/user-coupons/', views.get_my_coupons_api, name='my_coupons'),
    
    # --- Django Admin ---
    path('admin/', admin.site.urls),
]
# Force Reload Fix

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)