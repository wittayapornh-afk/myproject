from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken import views as token_views
from django.conf import settings
from django.conf.urls.static import static
from myapp import views

urlpatterns = [
    # --- Auth ---
    path('api/login/', token_views.obtain_auth_token, name='api_token_auth'),
    path('api/register/', views.register_api, name='register_api'),
    path('api/logout/', views.logout_api, name='logout_api'),
    path('api/profile/', views.user_profile_api, name='user_profile'),
    path('api/admin/users/', views.get_all_users, name='get_all_users'),

    # --- Products ---
    path('api/products/', views.products_api, name='products_api'),
    path('api/products/add/', views.add_product_api, name='add_product'),
    path('api/products/<int:product_id>/', views.product_detail_api, name='product_detail_api'),
    
    # ✅ แก้ไขตรงนี้: ย้าย <int:product_id> มาไว้ก่อน edit และ delete เพื่อให้ตรงกับ Frontend
    path('api/products/<int:product_id>/edit/', views.edit_product_api, name='edit_product'),
    path('api/products/<int:product_id>/delete/', views.delete_product_api, name='delete_product'),
    
    path('api/categories/', views.categories_api, name='categories_api'),

    # --- Orders ---
    path('api/orders/create/', views.create_order, name='create_order'),
    path('api/orders/<int:order_id>/update/', views.update_order_status, name='update_order'),
    path('api/my-orders/', views.my_orders_api, name='my_orders'),

    # --- Admin Stats ---
    path('api/admin-stats/', views.get_admin_stats, name='admin_stats_api'),
    path('api/admin-logs/', views.get_admin_logs, name='get_admin_logs'),
    
    path('admin/', admin.site.urls),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)