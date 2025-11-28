from django.urls import path
from myapp import views


urlpatterns = [
   path("fetch/", views.fetch_api),
   path("api/products/", views.api_products),
]
urlpatterns = [
   path("fetch/", views.fetch_api),
   path("api/products/", views.api_products),
   # 👇 เพิ่มบรรทัดนี้ครับ
   path("api/products/<int:product_id>/", views.api_product_detail),
   path("api/checkout/", views.api_checkout),
]