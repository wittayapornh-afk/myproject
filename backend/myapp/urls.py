# ไฟล์: backend/myporject/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static # 👈 1. เพิ่มบรรทัดนี้

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('myapp.urls')),
]

# 👇 2. เพิ่มส่วนนี้ต่อท้ายสุด เพื่อให้ Django ยอมส่งไฟล์ Media ออกมา
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)