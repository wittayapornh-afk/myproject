from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.authtoken import views as token_views
from . import views

urlpatterns = [
    # Public
    path('products/', views.products_api),
    path('products/<int:product_id>/', views.product_detail_api),
    path('categories/', views.categories_api),
    
    # Auth
    path('login/', token_views.obtain_auth_token),
    path('logout/', views.logout_api),
    path('register/', views.register_api),
    path('profile/', views.user_profile_api),
    
    # User Orders
    path('orders/create/', views.create_order),
    path('my-orders/', views.my_orders_api),
    
    # Admin Dashboard
    path('admin-stats/', views.get_admin_stats),
    path('admin/products/', views.admin_products_list),
    path('products/add/', views.add_product_api),
    path('products/<int:product_id>/edit/', views.edit_product_api),
    path('products/<int:product_id>/delete/', views.delete_product_api),
    
    path('admin/orders/', views.admin_orders_list),
    path('orders/<int:order_id>/update/', views.update_order_status),
    
    # Super Admin
    path('admin/users/', views.get_all_users),
    path('admin/users/role/', views.manage_user_role), # ✅ เส้นนี้สำคัญสำหรับแก้ Role
    path('admin-logs/', views.get_admin_logs),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)