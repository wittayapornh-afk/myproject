from django.urls import path
from myapp import views


urlpatterns = [
   path("fetch/", views.fetch_api),
   path("api/products/", views.api_products),
]