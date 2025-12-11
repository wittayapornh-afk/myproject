from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken import views as token_views
from django.conf import settings
from django.conf.urls.static import static
from . import views  # ✅ ต้องมีบรรทัดนี้เพื่อเรียกใช้ views

urlpatterns = [
    # สินค้า
    path('products/', views.products_api, name='products_api'),
    path('products/<int:product_id>/', views.product_detail_api, name='product_detail_api'),
    path('categories/', views.categories_api, name='categories_api'),
    
    # ออเดอร์
    path('orders/create/', views.create_order, name='create_order'),
    path('orders/<int:order_id>/update/', views.update_order_status, name='update_order'),
    path('my-orders/', views.my_orders_api, name='my_orders'),
    
    # ผู้ใช้งาน (Auth)
    path('products/add/', views.add_product_api, name='add_product'),
    path('login/', token_views.obtain_auth_token, name='api_token_auth'),
    path('admin/users/', views.get_all_users, name='get_all_users'),
    path('register/', views.register_api, name='register_api'),
    path('profile/', views.user_profile_api, name='user_profile'),
    
    # Admin Stats
    path('admin-stats/', views.get_admin_stats, name='admin_stats_api'),
    path('admin-logs/', views.get_admin_logs, name='get_admin_logs'),

    # ❌ ลบบรรทัดเหล่านี้ออก เพราะซ้ำซ้อนและทำให้เกิด Loop
    # path('admin/', admin.site.urls),
    # path('api/', include('myapp.urls')), 
    # path('api/login/', token_views.obtain_auth_token),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)