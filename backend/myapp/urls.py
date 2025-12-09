from django.urls import path
from . import views

urlpatterns = [
    # ... (URL เดิมของ products และ admin) ...
    path('products/', views.products_api),
    path('products/<int:product_id>/', views.product_detail_api),
    path('admin/stats/', views.get_admin_stats),
    path('categories/', views.categories_api if hasattr(views, 'categories_api') else views.products_api), # กัน Error ไว้ก่อน

    # ✅ เพิ่ม URL สำหรับ Login/Register
    path('login/', views.login_api),
    path('register/', views.register_api),
]