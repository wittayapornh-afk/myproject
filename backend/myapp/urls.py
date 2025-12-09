from django.urls import path
from . import views

urlpatterns = [
    # 🛒 เส้นทางสำหรับสินค้า
    path('products/', views.products_api),
    path('products/<int:product_id>/', views.product_detail_api),
    path('categories/', views.categories_api),

    # 👮 เส้นทางสำหรับ Admin
    path('admin/stats/', views.get_admin_stats),
]