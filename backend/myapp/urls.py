from django.urls import path
from myapp import views

urlpatterns = [
   path("fetch/", views.fetch_api),
   path("api/products/", views.api_products),
   path("api/products/<int:product_id>/", views.api_product_detail),
   path("api/products/<int:product_id>/reviews/", views.api_add_review),
   path("api/checkout/", views.api_checkout),
   path("api/orders/", views.api_order_history), # ✅ URL ใหม่
]