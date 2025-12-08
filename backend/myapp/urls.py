from django.urls import path
from myapp import views

urlpatterns = [
   path("fetch/", views.fetch_api),
   path("api/products/", views.api_products),
   path("api/products/<int:product_id>/", views.api_product_detail),
   path("api/products/<int:product_id>/reviews/", views.api_add_review),
   path("api/checkout/", views.api_checkout),
<<<<<<< HEAD
   path("api/orders/", views.api_order_history), 
   path("api/categories/", views.api_categories),
   path("api/register/", views.api_register), 
    path("api/login/", views.api_login),
    path("api/admin/stats/", views.api_dashboard_stats),
=======
   path("api/orders/", views.api_order_history), # ✅ URL ใหม่
>>>>>>> 6b750db946e3753df985d60eabebb30c65417bd6
]