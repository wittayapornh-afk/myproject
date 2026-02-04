from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from myapp import views

urlpatterns = [
    path('admin/', admin.site.urls),

    # ==============================
    # 🔐 Auth APIs (Login/Register/Logout/Profile)
    # ==============================
    path('api/login/', views.login_api),
    path('api/register/', views.register_api),
    path('api/check-username/', views.check_username_api), # ✅ Check Username
    path('api/logout/', views.logout_api),
    path('api/profile/', views.user_profile_api),
    path('api/change-password/', views.change_password_api, name='change_password_api'), # ✅ Change Password
    path('api/auth/reset-password/', views.reset_password_api), # ✅ Password Reset
    path('api/users/', views.get_all_users),           # Admin ดู user ทั้งหมด

    # ==============================
    # 🛒 Product APIs (หน้าบ้าน)
    # ==============================
    path('api/products/', views.products_api),
    path('api/products/by-tags/', views.get_products_by_tags_api), # ✅ Fetch Products by Tags
    path('api/categories/', views.categories_api),
    path('api/menu-configs/', views.get_menu_configs_api, name='get_menu_configs'), # ✅ Fix 404
    path('api/brands/', views.brands_api), # ✅ Add brands API
    
    # --- Tags (🏷️ Tag System) ---
    path('api/tags/', views.tag_api, name='tags_api'),  # GET: ดึง Tags ทั้งหมด, POST: สร้าง Tag ใหม่
    path('api/tags/<int:tag_id>/', views.tag_api, name='tag_detail'),  # DELETE: ลบ Tag
    path('api/products/<int:product_id>/tags/', views.product_tags_api, name='product_tags'),  # POST: กำหนด Tags ให้สินค้า
    path('api/tags/automation/run/', views.run_tag_automation_api), # ✅ Add Automation API
    path('api/products/bulk-update-tags/', views.bulk_update_tags_api), # ✅ Add Bulk Update API
    path('api/tags/<str:slug>/', views.tag_by_slug_api, name='tag_by_slug'), # ✅ Tag by Slug
    
    # ✅ แก้เป็น products (เติม s) ให้ตรงกับ Frontend
    path('api/products/<int:product_id>/', views.product_detail_api),
    path('api/products/<int:product_id>/related/', views.get_related_products), # ✅ Add Related Products
    path('api/submit-review/', views.submit_review), # ✅ เพิ่ม path สำหรับรีวิว
    path('api/reviews/<int:review_id>/reply/', views.reply_review_api), # ✅ เพิ่ม path สำหรับตอบกลับรีวิว

    # ==============================
    # 📦 Order APIs (ลูกค้าสั่งซื้อ)
    # ==============================
    path('api/checkout/', views.create_order),     # ✅ Updated to use create_order
    path('api/orders/', views.my_orders_api),      # ✅ เพิ่มให้ใน views แล้ว

    # ==============================
    # 🎟️ Coupon & Flash Sale APIs
    # ==============================
    path('api/coupons/<int:coupon_id>/collect/', views.collect_coupon_api), # ✅ Coupon Collection
    path('api/user-coupons/', views.get_my_coupons_api), # ✅ My Coupons
    path('api/coupons/validate/', views.validate_coupon_api),
    path('api/flash-sales/active/', views.get_active_flash_sales_api),
    path('api/admin/coupons/', views.admin_coupon_api),
    path('api/admin/coupons/<int:coupon_id>/', views.admin_coupon_api),
    path('api/admin/flash-sales/', views.admin_flash_sale_api),
    path('api/admin/flash-sales/<int:fs_id>/', views.admin_flash_sale_api),
    
    # 🎯 Flash Sale Campaigns (Timeline & Batch View)
    path('api/admin/campaigns/', views.admin_campaign_api),
    path('api/admin/campaigns/<int:campaign_id>/', views.admin_campaign_api),
    path('api/admin/campaigns/<int:campaign_id>/flash-sales/', views.get_campaign_flash_sales),
    path('api/orders/<int:order_id>/confirm-received/', views.confirm_received_api), # ✅ Confirm Received
    path('api/upload_slip/<int:order_id>/', views.upload_slip), # ✅ Upload Slip
    path('api/payment/promptpay_payload/', views.generate_promptpay_qr_api), # ✅ Helper for Checkout UI
    
    # ==============================
    # 🔔 Notification API
    # ==============================
    path('api/notifications/', views.get_notifications),

    # ==============================
    # 🛡️ Admin Dashboard & Management APIs
    # ==============================
    # 1. Dashboard Stats
    path('api/admin-stats/', views.get_admin_stats), # ✅ Corrected Path
    path('api/admin/categories-list/', views.get_categories), # ✅ New Categories Dropdown
    path('api/admin/export_orders/', views.export_orders_csv), # ✅ New Export CSV

    # 2. จัดการสินค้า (Admin)
    path('api/admin/all_products/', views.get_all_products_admin_api), # ดึงสินค้าทั้งหมด (Admin)
    path('api/admin/products/', views.get_all_products_admin_api), # ✅ Fix 404: Map requested URL to existing view
    path('api/add_product/', views.add_product_api),
    path('api/edit_product/<int:product_id>/', views.edit_product_api),
    path('api/delete_product/<int:product_id>/', views.delete_product_api),
    path('api/delete_product_image/<int:image_id>/', views.delete_product_image_api), # ลบรูป Gallery


    # 3. จัดการออเดอร์ (Admin)
    path('api/admin/orders_v2/', views.admin_orders_api_v4), # ✅ Point to V4 (Fixed View)
    path('api/admin/orders/bulk-update/', views.bulk_update_orders_api),
    path('api/admin/order_status/<int:order_id>/', views.update_order_status_api),
    path('api/admin/orders/', views.get_admin_orders, name='admin_orders'), # ✅ Fixed Missing Path
    path('api/admin/order/<int:order_id>/delete/', views.delete_order_api),
    
    # ✅ Missing Paths from User Reports
    path('api/coupons-public/', views.get_public_coupons),
    path('api/orders/create/', views.create_order), # Alternate path for Checkout

    # 4. จัดการผู้ใช้งาน (Admin)
    path('api/admin/users/', views.get_all_users),  # ✅ Fix 404
    path('api/admin/users/create/', views.create_system_user), # ✅ Create User
    path('api/admin/users/role/', views.manage_user_role), # ✅ Manage Role
    path('api/admin/user/<int:user_id>/update/', views.admin_update_user_api),
    path('api/admin/user/<int:user_id>/delete/', views.delete_user_api),

    # 5. Activity Logs (Admin)
    path('api/admin/logs/', views.get_admin_logs),
    path('api/admin/stock-history/', views.get_all_stock_history), # ✅ Global Stock History
    
    # ==============================
    # 🌍 SEO Utilities
    # ==============================
    path('sitemap.xml', views.sitemap_xml), # ✅ Dynamic Sitemap

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)