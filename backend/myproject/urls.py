from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from myapp import views # Import views ตัวเดียวพอ
from myapp.views import DashboardStatsView

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
    path('api/auth/reset-password/', views.reset_password_api), # ✅ Password Reset
    path('api/users/', views.get_all_users),           # Admin ดู user ทั้งหมด

    # ==============================
    # 🛒 Product APIs (หน้าบ้าน)
    # ==============================
    path('api/products/', views.products_api),
    path('api/categories/', views.categories_api),
    path('api/brands/', views.brands_api), # ✅ Add brands API
    # ✅ แก้เป็น products (เติม s) ให้ตรงกับ Frontend
    path('api/products/<int:product_id>/', views.product_detail_api),
    path('api/products/<int:product_id>/related/', views.get_related_products), # ✅ Add Related Products
    path('api/submit-review/', views.submit_review), # ✅ เพิ่ม path สำหรับรีวิว
    path('api/reviews/<int:review_id>/reply/', views.reply_review_api), # ✅ เพิ่ม path สำหรับตอบกลับรีวิว

    # ==============================
    # 📦 Order APIs (ลูกค้าสั่งซื้อ)
    # ==============================
    path('api/checkout/', views.checkout_api),     # ✅ เพิ่มให้ใน views แล้ว
    path('api/orders/', views.my_orders_api),      # ✅ เพิ่มให้ใน views แล้ว
    path('api/orders/<int:order_id>/confirm-received/', views.confirm_received_api), # ✅ Confirm Received
    path('api/upload_slip/<int:order_id>/', views.upload_slip), # ✅ Upload Slip
    path('api/upload_slip/<int:order_id>/', views.upload_slip), # ✅ Upload Slip
    path('api/payment/promptpay_payload/', views.get_promptpay_payload), # ✅ Helper for Checkout UI
    
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
    path('api/add_product/', views.add_product_api),
    path('api/edit_product/<int:product_id>/', views.edit_product_api),
    path('api/delete_product/<int:product_id>/', views.delete_product_api),
    path('api/delete_product_image/<int:image_id>/', views.delete_product_image_api), # ลบรูป Gallery


    # 3. จัดการออเดอร์ (Admin)
    path('api/admin/orders_v2/', views.get_admin_orders), 
    path('api/admin/orders/bulk-update/', views.bulk_update_orders_api), # ✅ Bulk Update
    path('api/admin/order_status/<int:order_id>/', views.update_order_status_api),

    # 4. จัดการผู้ใช้งาน (Admin)
    path('api/admin/user/<int:user_id>/update/', views.admin_update_user_api),
    path('api/admin/user/<int:user_id>/delete/', views.delete_user_api),

    # 5. Activity Logs (Admin)
    path('api/admin/logs/', views.get_admin_logs),
    path('api/admin/stock-history/', views.get_all_stock_history), # ✅ Global Stock History

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)