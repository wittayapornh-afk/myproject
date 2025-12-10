from django.urls import path
from . import views

urlpatterns = [
    # สินค้า & หมวดหมู่ (Public)
    path('products/', views.products_api, name='products_api'),
    path('products/<int:product_id>/', views.product_detail_api, name='product_detail_api'),
    path('categories/', views.categories_api, name='categories_api'),

    # Admin Dashboard
    path('admin-stats/', views.get_admin_stats, name='admin_stats_api'),
]