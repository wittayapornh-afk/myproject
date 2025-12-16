from django.db import models
from django.contrib.auth.models import User

# ❌ ลบบรรทัดนี้ทิ้งครับ: from .models import ...

# ==========================================
# 👤 ส่วนจัดการผู้ใช้งาน (User & Roles)
# ==========================================

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, default='user')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    # เพิ่มบรรทัดนี้สำหรับเบอร์โทร
    phone = models.CharField(max_length=15, blank=True, default='') 

    def __str__(self):
        return self.user.username

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    phone = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()}"

# ==========================================
# 🛒 ส่วนสินค้าและร้านค้า
# ==========================================

class Product(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100)
    price = models.FloatField()
    thumbnail = models.ImageField(upload_to='products/', null=True, blank=True)
    rating = models.FloatField(default=0)
    stock = models.IntegerField(default=0)
    brand = models.CharField(max_length=100, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images') 
    image = models.ImageField(upload_to='products/gallery/')

    def __str__(self):
        return f"{self.product.title} Image"

# ==========================================
# 📦 ส่วนคำสั่งซื้อ (Order System)
# ==========================================

class Order(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'รอชำระเงิน'),
        ('Paid', 'ชำระแล้ว (รอตรวจสอบ)'),
        ('Processing', 'กำลังเตรียมสินค้า'),
        ('Shipped', 'จัดส่งแล้ว'),
        ('Completed', 'ได้รับสินค้าแล้ว'),
        ('Cancelled', 'ยกเลิก'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    customer_name = models.CharField(max_length=100)
    customer_tel = models.CharField(max_length=20)
    customer_email = models.EmailField(blank=True, null=True)
    address = models.TextField()
    
    total_price = models.FloatField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    
    payment_slip = models.ImageField(upload_to='slips/', null=True, blank=True)
    payment_method = models.CharField(max_length=50, default='Transfer')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{self.id} - {self.customer_name} ({self.status})"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    price = models.FloatField()

    def __str__(self):
        return f"{self.product.title} (x{self.quantity})"

class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField(default=5)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

# ==========================================
# 🛡️ ส่วน Super Admin (Logs)
# ==========================================

class AdminLog(models.Model):
    admin = models.ForeignKey(User, on_delete=models.CASCADE)
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.admin.username}: {self.action}"