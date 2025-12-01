from django.db import models

class Product(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100)
    price = models.FloatField()
    rating = models.FloatField(null=True, blank=True)
    stock = models.IntegerField(null=True, blank=True)
    brand = models.CharField(max_length=100, null=True, blank=True)
    
    # รูปภาพ (Hybrid: URL + Upload)
    thumbnail = models.TextField(null=True, blank=True) 
    image = models.ImageField(upload_to='products/', null=True, blank=True)

    # ⭐ เช็คว่าสินค้านี้ถูกแก้ไขโดยเราหรือยัง
    is_edited = models.BooleanField(default=False)

    def __str__(self):
        return self.title

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    image_url = models.TextField()

    def __str__(self):
        return self.image_url

# ⭐ ตารางเก็บประวัติการลบ (บัญชีดำ)
class DeletedLog(models.Model):
    product_id = models.IntegerField(unique=True)
    deleted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Deleted ID: {self.product_id}"