from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone

# ==========================================
# 👤 Custom User Model
# ==========================================

class UserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('role', 'admin')
        extra_fields.setdefault('is_active', True)
        
        # Superuser needs to be active and admin
        if extra_fields.get('role') != 'admin':
            raise ValueError('Superuser must have role="admin".')

        return self.create_user(username, email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        NEW_USER = 'new_user', 'New User'
        CUSTOMER = 'customer', 'Customer'
        SELLER = 'seller', 'Seller'
        ADMIN = 'admin', 'Super Admin'

    username = models.CharField(max_length=150, unique=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    email = models.EmailField(max_length=254, unique=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    image = models.ImageField(upload_to='avatars/', null=True, blank=True, db_column='image') # db_column='image' matches DB
    
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.NEW_USER)
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email', 'first_name', 'last_name']

    class Meta:
        db_table = 'users'


    def __str__(self):
        return self.username

    # Properties to map role to Django permissions
    @property
    def is_staff(self):
        return self.role in ['admin', 'seller']

    @property
    def is_superuser(self):
        return self.role == 'admin'

# ==========================================
# 🛒 Product System
# ==========================================

class Product(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2) # Changed to Decimal matching DB
    stock = models.IntegerField(default=0)
    brand = models.CharField(max_length=100, null=True, blank=True)
    thumbnail = models.ImageField(upload_to='products/', null=True, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00) # Changed to Decimal
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now) # DB has created_at
    updated_at = models.DateTimeField(auto_now=True)
    seller = models.ForeignKey('User', on_delete=models.CASCADE, null=True, blank=True, related_name='products', db_column='seller_id')

    class Meta:
        db_table = 'products'


    def __str__(self):
        return self.title

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image_url = models.ImageField(upload_to='products/gallery/', db_column='image_url') # DB uses image_url
    created_at = models.DateTimeField(default=timezone.now) # DB has created_at
    
    # Model field name is 'image_url' to match DB column, 
    # but we should ensure the upload_to works. 
    # Actually ImageField usually maps to a column. 

    class Meta:
        db_table = 'product_images'


    def __str__(self):
        return f"{self.product.title} Image"

# ==========================================
# 📦 Order System
# ==========================================

class Order(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Paid', 'Paid'),
        ('Processing', 'Processing'),
        ('Shipped', 'Shipped'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    customer_name = models.CharField(max_length=150) # DB VARCHAR(150)
    customer_tel = models.CharField(max_length=20)
    customer_email = models.CharField(max_length=254, null=True, blank=True) # DB VARCHAR(254)
    shipping_address = models.TextField() # DB 'shipping_address'
    
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    
    payment_method = models.CharField(max_length=50, default='Transfer')
    payment_slip = models.CharField(max_length=255, null=True, blank=True) # DB is VARCHAR(255) for path
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'orders'


    def __str__(self):
        return f"Order #{self.id} - {self.customer_name}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    # 🚩 แก้ไขบรรทัดนี้: เปลี่ยนจาก 'reviews' เป็น 'order_items'
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='order_items') 
    quantity = models.PositiveIntegerField(default=1)
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'order_items'


    def __str__(self):
        return f"{self.product.title} (x{self.quantity})"



class Review(models.Model):
    # ✅ บรรทัดนี้ให้ใช้ 'reviews'
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField(default=5)
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # ✅ Fields for Reply (Admin/Seller)
    reply_comment = models.TextField(blank=True, null=True)
    reply_timestamp = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']


    def __str__(self):
        return f"{self.user.username} - {self.product.title} ({self.rating})"


class AdminLog(models.Model):
    admin = models.ForeignKey(User, on_delete=models.CASCADE, related_name='admin_logs') # DB column 'admin_id'
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(default=timezone.now) # DB 'timestamp'
    # DB also has 'details' and 'ip_address' as generic fields but simplistic version in older model. 
    # db_schema.sql has: `action`, `details`, `ip_address`, `timestamp`.
    # I will add details/ip to match schema.
    details = models.TextField(null=True, blank=True)
    ip_address = models.CharField(max_length=45, null=True, blank=True)

    class Meta:
        db_table = 'admin_logs'
