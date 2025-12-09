from django.urls import path
from myapp import views

urlpatterns = [
   path("fetch/", views.fetch_api),
   path("api/products/", views.api_products),
   path("api/products/<int:product_id>/", views.api_product_detail),
   path("api/products/<int:product_id>/reviews/", views.api_add_review),
   path("api/categories/", views.api_categories),
   path("api/checkout/", views.api_checkout),
   path("api/orders/", views.api_order_history),
   path("api/register/", views.api_register),      # ✅ สมัครสมาชิก
   path("api/login/", views.api_login),            # ✅ เข้าสู่ระบบ
   path("api/admin/stats/", views.api_dashboard_stats), # ✅ แดชบอร์ด
]