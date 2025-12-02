from django.db import models

class Product(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100)
    price = models.FloatField()
    thumbnail = models.ImageField(upload_to='products/', null=True, blank=True)
    
    # ✅ เพิ่ม default=0
    rating = models.FloatField(null=True, blank=True, default=0)
    stock = models.IntegerField(null=True, blank=True)
    brand = models.CharField(max_length=100, null=True, blank=True)
    
    def __str__(self):
        return self.title

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to='products/gallery/', null=True, blank=True)

    def __str__(self):
        return f"{self.product.title} Image"

# ✅ เพิ่ม Model ใหม่: Review
class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="reviews")
    user = models.CharField(max_length=100)  # ชื่อคนรีวิว
    rating = models.IntegerField(default=5)  # คะแนน 1-5
    comment = models.TextField(blank=True)   # ข้อความรีวิว
    created_at = models.DateTimeField(auto_now_add=True) # วันที่รีวิว

    def __str__(self):
        return f"{self.user} - {self.product.title} ({self.rating})"