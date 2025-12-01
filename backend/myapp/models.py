from django.db import models

class Product(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100)
    price = models.FloatField()
    
    # ⚠️ แก้ตรงนี้: เปลี่ยนจาก URLField เป็น TextField เพื่อรองรับ Base64 Image
    thumbnail = models.TextField() 
    
    rating = models.FloatField(null=True, blank=True)
    stock = models.IntegerField(null=True, blank=True)
    brand = models.CharField(max_length=100, null=True, blank=True)
    
    def __str__(self):
        return self.title

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    image_url = models.TextField() # อันนี้เป็น TextField อยู่แล้ว OK

    def __str__(self):
        return self.image_url