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
        db_table = 'users' # ชื่อตารางในฐานข้อมูล



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

# ==========================================
# 📂 Category System (New)
# ==========================================
class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    
    class Meta:
        db_table = 'categories'
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name

# ==========================================
# 🏷️ Tag System (New)
# ==========================================
class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    
    class Meta:
        db_table = 'tags'

    def __str__(self):
        return self.name

from .validators import validate_product_name

class Product(models.Model):
    title = models.CharField(max_length=255, validators=[validate_product_name])
    description = models.TextField()
    
    # ✅ Change from CharField to ForeignKey
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    
    # ✅ New Fields for Normalization
    tags = models.ManyToManyField(Tag, blank=True, related_name='products')
    sku = models.CharField(max_length=100, unique=True, null=True, blank=True)
    weight = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True) # Weight in Kg/Lb
    
    # Dimensions (Embedded vs Separate Table - keeping simple as fields for now)
    width = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    height = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    depth = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    price = models.DecimalField(max_digits=10, decimal_places=2) # Changed to Decimal matching DB
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True) # ✅ New for "On Sale" filter
    stock = models.IntegerField(default=0)
    brand = models.CharField(max_length=100, null=True, blank=True)
    thumbnail = models.ImageField(upload_to='products/', null=True, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00) # คะแนนเฉลี่ย (เต็ม 5)
    is_active = models.BooleanField(default=True) # สถานะสินค้า (True=ขาย, False=ปิดการขาย)
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

class StockHistory(models.Model):
    ACTION_CHOICES = [
        ('sale', 'Sale'),
        ('restock', 'Restock'),
        ('adjustment', 'Adjustment'),
        ('return', 'Return'),
        ('cancel', 'Order Cancelled'),
        ('edit', 'Edit Info') # ✅ Support General Edits
    ]
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='stock_history')
    change_quantity = models.IntegerField(help_text="Negative for deduction, Positive for addition")
    remaining_stock = models.IntegerField()
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    note = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = 'stock_history'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.product.title} - {self.change_quantity} ({self.action})"

# ==========================================
# 🎟️ Coupon System (New)
# ==========================================
class Coupon(models.Model):
    DISCOUNT_TYPES = [
        ('percent', 'Percentage (%)'),
        ('fixed', 'Fixed Amount (THB)')
    ]

    code = models.CharField(max_length=50, unique=True, help_text="รหัสคูปอง (e.g. SALE50)")
    discount_type = models.CharField(max_length=10, choices=DISCOUNT_TYPES, default='fixed')
    discount_value = models.DecimalField(max_digits=10, decimal_places=2, help_text="มูลค่าส่วนลด")
    min_spend = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="ยอดซื้อขั้นต่ำ")
    
    usage_limit = models.IntegerField(default=100, help_text="จำนวนสิทธิ์ทั้งหมด")
    used_count = models.IntegerField(default=0, help_text="ใช้ไปแล้ว")
    
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField()
    active = models.BooleanField(default=True)

    max_use_per_user = models.IntegerField(default=1, help_text="จำกัดสิทธิ์ต่อคน")
    allowed_roles = models.JSONField(default=list, blank=True, help_text="Roles that can use this coupon (e.g. ['member', 'vip'])")
    
    class Meta:
        db_table = 'coupons'
        ordering = ['-end_date']

    def __str__(self):
        return f"{self.code} - {self.discount_value} ({self.discount_type})"

    def is_valid(self, user=None):
        now = timezone.now()
        is_active = self.active and self.start_date <= now <= self.end_date and self.used_count < self.usage_limit
        if not is_active:
            return False
            
        if user:
            # Check Role
            if self.allowed_roles and len(self.allowed_roles) > 0:
                user_role = getattr(user, 'role', 'customer')
                if user_role not in self.allowed_roles:
                    return False

            # Check user usage history
            user_usage = Order.objects.filter(user=user, coupon=self).count()
            if user_usage >= self.max_use_per_user:
                return False
        return True

# ==========================================
# ⚡ Flash Sale System (New)
# ==========================================
class FlashSale(models.Model):
    name = models.CharField(max_length=100)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'flash_sales'
        ordering = ['-start_time']

    def __str__(self):
        return f"{self.name} ({self.start_time} - {self.end_time})"

    @property
    def status(self):
        now = timezone.now()
        if not self.is_active:
            return 'Inactive'
        if now < self.start_time:
            return 'Upcoming'
        elif self.start_time <= now <= self.end_time:
            return 'Live'
        else:
            return 'Ended'

class FlashSaleProduct(models.Model):
    flash_sale = models.ForeignKey(FlashSale, on_delete=models.CASCADE, related_name='products')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='flash_sales') # Allows reverse check
    sale_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity_limit = models.IntegerField(default=10, help_text="จำนวนสินค้าที่จัดโปร")
    sold_count = models.IntegerField(default=0)

    class Meta:
        db_table = 'flash_sale_products'
        unique_together = ('flash_sale', 'product')

    def __str__(self):
        return f"{self.product.title} @ {self.sale_price}"

    def is_available(self):
        return self.sold_count < self.quantity_limit and self.flash_sale.status == 'Live'


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
    shipping_province = models.CharField(max_length=100, null=True, blank=True) # ✅ New: Store Province separately for Analytics
    
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    
    payment_method = models.CharField(max_length=50, default='Transfer') # วิธีการชำระเงิน (Transfer/Credit)
    payment_slip = models.CharField(max_length=255, null=True, blank=True) # เก็บ path รูปสลิป (เวอร์ชั่นเก่า)
    
    # ✅ New Fields for Payment Slip Verification (ข้อมูลสำหรับการตรวจสอบสลิป)
    slip_image = models.ImageField(upload_to='slips/', null=True, blank=True)
    payment_date = models.DateTimeField(null=True, blank=True)
    
    # ✅ Strict Payment Verification (ข้อมูลสลิปที่ตรวจสอบแล้ว)
    transfer_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    transfer_date = models.DateTimeField(null=True, blank=True)
    bank_name = models.CharField(max_length=100, null=True, blank=True)
    transfer_account_number = models.CharField(max_length=50, null=True, blank=True) # ✅ เลขบัญชีที่โอนเข้า
    
    # ✅ Coupon Usage
    coupon = models.ForeignKey(Coupon, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
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
