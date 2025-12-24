from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver 

# ==========================================
# 👤 Model โปรไฟล์ผู้ใช้
# ==========================================
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, default='user')
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

    def __str__(self):
        return self.user.username

# ==========================================
# 🛒 Model สินค้า (Products) - ✅ เพิ่ม created_at
# ==========================================
class Product(models.Model):
    title = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    description = models.TextField(blank=True, null=True)
    stock = models.IntegerField(default=0)
    category = models.CharField(max_length=100, default='General')
    thumbnail = models.ImageField(upload_to='products/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    brand = models.CharField(max_length=100, blank=True, null=True)
    rating = models.FloatField(default=0.0)
    
    # ✅ เพิ่ม 2 บรรทัดนี้ เพื่อแก้ Error 1364
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='products/gallery/')
    # เพิ่ม created_at ด้วยเผื่อตารางนี้ก็มี
    created_at = models.DateTimeField(auto_now_add=True) 

# ==========================================
# 📦 Model คำสั่งซื้อ (Orders)
# ==========================================
class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=50, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)
    customer_name = models.CharField(max_length=200, default='')
    customer_email = models.EmailField(max_length=200, default='', blank=True)
    customer_tel = models.CharField(max_length=20, default='', blank=True)
    address = models.TextField(default='', blank=True)
    payment_method = models.CharField(max_length=50, default='Transfer')

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

# ==========================================
# 💬 Model รีวิว (Reviews)
# ==========================================
class Review(models.Model):
    product = models.ForeignKey(Product, related_name='reviews', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField(default=5)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    parent = models.ForeignKey('self', null=True, blank=True, related_name='replies', on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user} review {self.product}"

# ==========================================
# 📝 Model บันทึกกิจกรรม (ActivityLog)
# ==========================================
class ActivityLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=50) 
    target = models.CharField(max_length=255) 
    details = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.action}"