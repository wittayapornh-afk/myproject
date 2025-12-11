from django.db import models
from django.contrib.auth.models import User

# ==========================================
# 👤 ส่วนจัดการผู้ใช้งาน (User & Roles)
# ==========================================

class UserProfile(models.Model):
    # กำหนด Role ตามที่คุณต้องการ
    ROLE_CHOICES = [
        ('user', 'User (ผู้เยี่ยมชม/สมาชิกใหม่)'),
        ('customer', 'Customer (ลูกค้าที่เคยซื้อ)'),
        ('admin', 'Admin (เจ้าของร้าน/คนขาย)'),
        ('super_admin', 'Super Admin (ผู้ดูแลระบบสูงสุด)'),
    ]

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
    is_active = models.BooleanField(default=True) # แอดมินปิดการขายชั่วคราวได้
    created_at = models.DateTimeField(auto_now_add=True) # เก็บเวลาที่สร้างสินค้า
    
    def __str__(self):
        return self.title

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to='products/gallery/', null=True, blank=True)

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
    
    # เชื่อมกับ User (ถ้าไม่ได้ล็อกอิน จะเป็น null ได้สำหรับ Guest)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    # ข้อมูลสำหรับจัดส่ง
    customer_name = models.CharField(max_length=100)
    customer_tel = models.CharField(max_length=20)
    customer_email = models.EmailField(blank=True, null=True)
    address = models.TextField()
    
    total_price = models.FloatField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    
    # หลักฐานการโอนเงิน (สำหรับ Customer อัปโหลด)
    payment_slip = models.ImageField(upload_to='slips/', null=True, blank=True)
    payment_method = models.CharField(max_length=50, default='Transfer') # Transfer, Credit Card
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{self.id} - {self.customer_name} ({self.status})"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    price = models.FloatField() # ราคา ณ วันที่ซื้อ (เผื่ออนาคตสินค้าราคาเปลี่ยน)

    def __str__(self):
        return f"{self.product.title} (x{self.quantity})"

class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey(User, on_delete=models.CASCADE) # ต้องเป็นสมาชิกถึงรีวิวได้
    rating = models.IntegerField(default=5)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

# ==========================================
# 🛡️ ส่วน Super Admin (Logs)
# ==========================================

class AdminLog(models.Model):
    admin = models.ForeignKey(User, on_delete=models.CASCADE)
    action = models.CharField(max_length=255) # เช่น "แก้ไขสินค้า ID 5", "ยืนยันออเดอร์ #10"
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.admin.username}: {self.action}"