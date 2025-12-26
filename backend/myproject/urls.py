from django.contrib import admin
from django.urls import path
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
    path('api/logout/', views.logout_api),
    path('api/user/profile/', views.user_profile_api),
    path('api/users/', views.get_all_users),           # Admin ดู user ทั้งหมด

    # ==============================
    # 🛒 Product APIs (หน้าบ้าน)
    # ==============================
    path('api/products/', views.products_api),
    path('api/categories/', views.categories_api),
    path('api/product/<int:product_id>/', views.product_detail_api),

    # ==============================
    # 📦 Order APIs (ลูกค้าสั่งซื้อ)
    # ==============================
    path('api/checkout/', views.checkout_api),     # ✅ เพิ่มให้ใน views แล้ว
    path('api/orders/', views.my_orders_api),      # ✅ เพิ่มให้ใน views แล้ว

    # ==============================
    # 🛡️ Admin Dashboard & Management APIs
    # ==============================
    # 1. Dashboard Stats
    path('api/admin/dashboard-stats/', DashboardStatsView.as_view()),

    # 2. จัดการสินค้า (Admin)
    path('api/admin/all_products/', views.get_all_products_admin_api), # ดึงสินค้าทั้งหมด (Admin)
    path('api/add_product/', views.add_product_api),
    path('api/edit_product/<int:product_id>/', views.edit_product_api),
    path('api/delete_product/<int:product_id>/', views.delete_product_api),
    path('api/delete_product_image/<int:image_id>/', views.delete_product_image_api), # ลบรูป Gallery


    # 3. จัดการออเดอร์ (Admin)
    path('api/admin/orders/', views.admin_orders_api), # ✅ ใช้ชื่อนี้ชื่อเดียว (ลบ admin_orders_list ออก)
    path('api/admin/order_status/<int:order_id>/', views.update_order_status_api),

    # 4. จัดการผู้ใช้งาน (Admin)
    path('api/admin/user/<int:user_id>/update/', views.admin_update_user_api),
    path('api/admin/user/<int:user_id>/delete/', views.delete_user_api),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)