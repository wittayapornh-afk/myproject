from django.db import models
<<<<<<< HEAD
from django.contrib.auth.models import User

class Product(models.Model):
=======

class Product(models.Model):
    # ... (โค้ด Product เดิม) ...
>>>>>>> 6b750db946e3753df985d60eabebb30c65417bd6
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100)
    price = models.FloatField()
    thumbnail = models.ImageField(upload_to='products/', null=True, blank=True)
    rating = models.FloatField(null=True, blank=True, default=0)
    stock = models.IntegerField(null=True, blank=True)
    brand = models.CharField(max_length=100, null=True, blank=True)
    
    def __str__(self):
        return self.title

class ProductImage(models.Model):
<<<<<<< HEAD
=======
    # ... (โค้ดเดิม) ...
>>>>>>> 6b750db946e3753df985d60eabebb30c65417bd6
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to='products/gallery/', null=True, blank=True)

class Review(models.Model):
<<<<<<< HEAD
=======
    # ... (โค้ดเดิม) ...
>>>>>>> 6b750db946e3753df985d60eabebb30c65417bd6
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="reviews")
    user = models.CharField(max_length=100)
    rating = models.IntegerField(default=5)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

<<<<<<< HEAD
=======
# ✅ เพิ่ม Model ใหม่: Order (บิลสั่งซื้อ)
>>>>>>> 6b750db946e3753df985d60eabebb30c65417bd6
class Order(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'รอตรวจสอบ'),
        ('Processing', 'กำลังเตรียมสินค้า'),
        ('Shipped', 'จัดส่งแล้ว'),
        ('Delivered', 'ได้รับสินค้าแล้ว'),
    ]
    
<<<<<<< HEAD
    # ✅ บรรทัดนี้สำคัญมาก! ต้องมีเพื่อให้เชื่อมกับ User ได้
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    customer_name = models.CharField(max_length=100)
    customer_tel = models.CharField(max_length=20)
=======
    customer_name = models.CharField(max_length=100)
    customer_tel = models.CharField(max_length=20) # ใช้เบอร์โทรเป็น Key ในการค้นหา
>>>>>>> 6b750db946e3753df985d60eabebb30c65417bd6
    address = models.TextField()
    total_price = models.FloatField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Processing')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} - {self.customer_name}"

<<<<<<< HEAD
=======
# ✅ เพิ่ม Model ใหม่: OrderItem (รายการของในบิล)
>>>>>>> 6b750db946e3753df985d60eabebb30c65417bd6
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
<<<<<<< HEAD
    price = models.FloatField()
=======
    price = models.FloatField() # ราคา ณ วันที่ซื้อ
>>>>>>> 6b750db946e3753df985d60eabebb30c65417bd6

    def __str__(self):
        return f"{self.product.title} (x{self.quantity})"