from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver

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
        ADMIN = 'admin', 'Admin'
        SUPER_ADMIN = 'super_admin', 'Super Admin'

    username = models.CharField(max_length=150, unique=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    email = models.EmailField(max_length=254, unique=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    province = models.CharField(max_length=100, null=True, blank=True) # ✅ New
    zipcode = models.CharField(max_length=10, null=True, blank=True)   # ✅ New
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)   # ✅ New
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)  # ✅ New
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
        return self.role in ['admin', 'super_admin']

    @property
    def is_superuser(self):
        return self.role == 'super_admin'

# ==========================================
# 🛒 Product System
# ==========================================

# ==========================================
# 🍌 Mega Menu Config
# ==========================================
from .models_menu import MegaMenuConfig

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
    GROUP_CHOICES = [
        ('category', 'หมวดหมู่ (Category)'),
        ('promotion', 'โปรโมชั่น (Promotion)'),
        ('feature', 'คุณสมบัติ (Feature)'),
        ('brand', 'แบรนด์ (Brand)'),
        ('other', 'อื่นๆ (Other)'),
    ]

    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True, null=True, help_text="URL-friendly name (Auto-generated)")
    group_name = models.CharField(max_length=50, choices=GROUP_CHOICES, default='other', help_text="กลุ่มของ Tag")
    color = models.CharField(max_length=20, default='#6366f1', help_text="สีของ Tag (Hex Code)")
    icon = models.CharField(max_length=50, null=True, blank=True, help_text="ชื่อไอคอนจาก Lucide")
    
    expiration_date = models.DateField(null=True, blank=True, help_text="วันหมดอายุ")
    automation_rules = models.JSONField(default=dict, blank=True, help_text="Automation Logic")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'tags'
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['group_name']),
        ]

    def save(self, *args, **kwargs):
        from django.utils.text import slugify
        if not self.slug:
            self.slug = slugify(self.name)
            # Ensure unique slug
            original_slug = self.slug
            count = 1
            while Tag.objects.filter(slug=self.slug).exists():
                self.slug = f"{original_slug}-{count}"
                count += 1
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.get_group_name_display()})"

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
    admin = models.ForeignKey('User', on_delete=models.CASCADE, null=True, blank=True, related_name='products', db_column='admin_id')

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
# 🎟️ Coupon System (V2 MAXIMUM)
# ==========================================
class Coupon(models.Model):
    DISCOUNT_TYPES = [
        ('percent', 'Percentage (%)'),
        ('fixed', 'Fixed Amount (THB)'),
        ('free_shipping', 'Free Shipping'),
        ('capped_percent', 'Capped Percentage (%)'), # ✅ New
        ('tiered', 'Tiered Discount') # ✅ New (V2)
    ]

    # --- Core Info ---
    code = models.CharField(max_length=50, unique=True, help_text="รหัสคูปอง (e.g. SALE50)", db_index=True)
    name = models.CharField(max_length=255, blank=True, help_text="ชื่อแคมเปญ (Internal)")
    description = models.TextField(blank=True, help_text="เงื่อนไขการใช้ (User-facing)")
    
    # --- Value ---
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPES, default='fixed')
    discount_value = models.DecimalField(max_digits=10, decimal_places=2, help_text="มูลค่าส่วนลด")
    max_discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="ลดสูงสุดไม่เกิน (สำหรับ Capped Percent)")
    min_spend = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="ยอดซื้อขั้นต่ำ")
    
    # --- Advanced Rules (The Brain) ---
    conditions = models.JSONField(default=dict, blank=True, help_text="Advanced rules (e.g. specific SKU, exclude category)")
    tiered_rules = models.JSONField(default=list, blank=True, help_text="e.g. [{'min':1000, 'disc':100}, {'min':3000, 'disc':500}]") # ✅ New (V2)
    
    # --- Quotas ---
    total_supply = models.IntegerField(default=1000000, help_text="จำนวนสิทธิ์ทั้งหมด (Global Limit)") # ✅ New (V2) Renamed from usage_limit logical overlap
    used_count = models.IntegerField(default=0, help_text="ใช้ไปแล้ว (Atomic)") # Renamed/Repurposed
    
    # Deprecated/Mapped to total_supply in logic if needed, but keeping for legacy compatibility or renaming if safe
    usage_limit = models.IntegerField(default=100, help_text="จำนวนสิทธิ์ทั้งหมด (Legacy field)") 
    
    limit_per_user = models.IntegerField(default=1, help_text="จำกัดสิทธิ์ต่อคน (ตลอดแคมเปญ)")
    limit_per_user_per_day = models.IntegerField(default=0, help_text="จำกัดสิทธิ์ต่อคนต่อวัน (0 = ไม่จำกัด)") # ✅ New (V2)
    
    # --- Timing ---
    start_date = models.DateTimeField(default=timezone.now, db_index=True)
    end_date = models.DateTimeField(db_index=True)
    active = models.BooleanField(default=True)
    priority = models.IntegerField(default=0, help_text="ลำดับความสำคัญ (Higher = Better)") # ✅ New (V2)
    
    # --- Behavior ---
    auto_apply = models.BooleanField(default=False, help_text="ระบบเลือกให้อัตโนมัติ")
    is_public = models.BooleanField(default=True, help_text="แสดงใน Coupon Center")
    is_stackable_with_flash_sale = models.BooleanField(default=False, help_text="ใช้ร่วมกับ Flash Sale ได้ไหม (Strict Rule)")

    allowed_roles = models.JSONField(default=list, blank=True, help_text="Roles: member, vip, etc.")
    target_user_roles = models.JSONField(default=list, blank=True, help_text="Target Group logic") # ✅ New (V2)
    
    class Meta:
        db_table = 'coupons'
        ordering = ['-priority', '-end_date'] # Updated ordering
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['start_date', 'end_date']),
            models.Index(fields=['priority']),
        ]

    def __str__(self):
        return f"{self.code} - {self.discount_value} ({self.discount_type})"

    def is_valid(self, user=None):
        now = timezone.now()
        # V2: Check total_supply OR usage_limit (legacy)
        limit = max(self.total_supply, self.usage_limit)
        is_active = self.active and self.start_date <= now <= self.end_date and self.used_count < limit
        if not is_active:
            return False
            
        if user:
            # Check Role
            if self.allowed_roles and len(self.allowed_roles) > 0:
                user_role = getattr(user, 'role', 'customer')
                if user_role not in self.allowed_roles:
                    return False
        return True

class UserCoupon(models.Model):
    """
    👛 Customer's Coupon Wallet
    Tracks collected coupons and their status/usage.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wallet_coupons')
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE, related_name='user_collections')
    
    collected_at = models.DateTimeField(auto_now_add=True)
    
    STATUS_CHOICES = [
        ('active', 'Ready to use'),
        ('used', 'Used'),
        ('expired', 'Expired'),
        ('locked', 'Locked in pending order') 
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    used_at = models.DateTimeField(null=True, blank=True)
    order_ref = models.ForeignKey('Order', null=True, blank=True, on_delete=models.SET_NULL, related_name='used_coupon_wallet') 
    
    class Meta:
        db_table = 'user_coupons'
        unique_together = ('user', 'coupon')

# ==========================================
# ⚡ Flash Sale System (V2)
# ==========================================

class FlashSaleCampaign(models.Model):
    """
    🎯 Flash Sale Campaign (แคมเปญใหญ่)
    
    กลุ่มของ Flash Sale หลายรอบรวมกัน เช่น:
    - "Mega Sale 12.12" ประกอบด้วย Flash Sale 5 รอบ
    - "After Party Sale" ประกอบด้วย Flash Sale 3 รอบ
    
    ใช้สำหรับ:
    1. จัดกลุ่มแคมเปญในมุมมอง Campaign Batch View
    2. แสดงภาพรวมแคมเปญทั้งหมดในปฏิทิน
    3. จัดการ Flash Sale หลายรอบพร้อมกัน
    """
    
    # ✅ บังคับให้ใช้ AutoField (AUTO_INCREMENT)
    id = models.AutoField(primary_key=True)
    
    # --- ข้อมูลพื้นฐาน ---
    name = models.CharField(
        max_length=200, 
        help_text="ชื่อแคมเปญ เช่น 'Mega Sale Phase 1', 'Double Day 11.11'"
    )
    description = models.TextField(
        blank=True, 
        help_text="รายละเอียดแคมเปญ (Internal use)"
    )
    
    # --- ช่วงเวลาของแคมเปญทั้งหมด ---
    campaign_start = models.DateTimeField(
        db_index=True,
        help_text="วันเริ่มต้นแคมเปญ (ครอบคลุม Flash Sale ทั้งหมดข้างใน)"
    )
    campaign_end = models.DateTimeField(
        db_index=True,
        help_text="วันสิ้นสุดแคมเปญ"
    )
    
    # --- UI/UX Customization ---
    banner_image = models.ImageField(
        upload_to='campaigns/', 
        blank=True, 
        null=True,
        help_text="รูป Banner สำหรับแคมเปญนี้"
    )
    theme_color = models.CharField(
        max_length=7, 
        default='#f97316',  # Orange
        help_text="สีธีมของแคมเปญ (HEX format เช่น #ff6600)"
    )
    
    # --- Meta Information ---
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(
        default=True,
        help_text="เปิด/ปิดการใช้งานแคมเปญ"
    )
    priority = models.IntegerField(
        default=0,
        help_text="ลำดับความสำคัญ (ใช้เรียงลำดับแสดงผล)"
    )
    
    class Meta:
        db_table = 'flash_sale_campaigns'
        ordering = ['-campaign_start', '-priority']
        indexes = [
            models.Index(fields=['campaign_start', 'campaign_end']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.campaign_start.date()} - {self.campaign_end.date()})"
    
    @property
    def flash_sale_count(self):
        """นับจำนวน Flash Sale ในแคมเปญนี้"""
        return self.flash_sales.count()
    
    @property
    def status(self):
        """สถานะของแคมเปญ"""
        now = timezone.now()
        if not self.is_active:
            return 'Inactive'
        if now < self.campaign_start:
            return 'Upcoming'
        elif self.campaign_start <= now <= self.campaign_end:
            return 'Active'
        else:
            return 'Ended'


class FlashSale(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True, help_text="รายละเอียดแคมเปญ")
    banner_image = models.ImageField(upload_to='flash_sales/', null=True, blank=True)
    
    start_time = models.DateTimeField(db_index=True)
    end_time = models.DateTimeField(db_index=True)
    
    is_active = models.BooleanField(default=True)
    priority = models.IntegerField(default=0, help_text="ลำดับความสำคัญ (กรณีเวลาชนกัน)")
    
    # ✅ NEW: เชื่อมกับ Campaign (Optional)
    campaign = models.ForeignKey(
        FlashSaleCampaign,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='flash_sales',
        help_text="แคมเปญที่ Flash Sale นี้เป็นส่วนหนึ่ง (Optional)"
    )
    
    # ✅ NEW: ลำดับการแสดงผลใน Timeline
    display_order = models.IntegerField(
        default=0,
        help_text="ลำดับการแสดงผลบน Timeline (เรียงจากน้อยไปมาก)"
    )
    
    # ✅ New V2 Fields
    rounds = models.JSONField(default=list, blank=True, help_text="Sub-rounds e.g. [{'start': '10:00', 'end': '12:00'}]")
    limit_per_user_total = models.IntegerField(default=5, help_text="จำกัดจำนวนชิ้นรวมต่อคนในแคมเปญนี้")
    
    # 🚩 Feature Flags - ควบคุมฟังก์ชันการทำงาน
    show_in_hero = models.BooleanField(
        default=True, 
        help_text="แสดงสินค้าในส่วน Hero Banner ของหน้าแรก"
    )
    enable_notification = models.BooleanField(
        default=True, 
        help_text="เปิดการแจ้งเตือนไปยังผู้ใช้"
    )
    auto_disable_on_end = models.BooleanField(
        default=True, 
        help_text="ปิดการใช้งานอัตโนมัติเมื่อถึงเวลา end_time"
    )
    limit_per_user_enabled = models.BooleanField(
        default=True, 
        help_text="บังคับใช้ limit_per_user_total (ปิดเพื่อไม่จำกัด)"
    )
    show_countdown_timer = models.BooleanField(
        default=True, 
        help_text="แสดง Countdown Timer ในหน้า Flash Sale"
    )
    
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
    
    # ==========================================
    # 🎨 Timeline Helper Methods (สำหรับ Visual Timeline View)
    # ==========================================
    
    @property
    def duration_hours(self):
        """
        คำนวณระยะเวลาเป็นชั่วโมง
        
        Returns:
            float: จำนวนชั่วโมง (เช่น 4.5 ชม.)
        """
        delta = self.end_time - self.start_time
        return delta.total_seconds() / 3600
    
    @property
    def timeline_position_percent(self):
        """
        คำนวณตำแหน่งเริ่มต้นบน Timeline (0-100%)
        
        สำหรับแสดงผลบน Timeline 24 ชั่วโมง:
        - 00:00 = 0%
        - 06:00 = 25%
        - 12:00 = 50%
        - 18:00 = 75%
        - 24:00 = 100%
        
        Returns:
            float: ตำแหน่ง % (0-100)
        """
        # เอาเฉพาะเวลาในวัน (ไม่สนวันที่)
        start_of_day = self.start_time.replace(hour=0, minute=0, second=0, microsecond=0)
        minutes_from_midnight = (self.start_time - start_of_day).total_seconds() / 60
        return (minutes_from_midnight / (24 * 60)) * 100
    
    @property
    def timeline_width_percent(self):
        """
        คำนวณความกว้างบน Timeline (0-100%)
        
        ความกว้างแทนระยะเวลา:
        - 1 ชม. = 4.17%
        - 3 ชม. = 12.5%
        - 4 ชม. = 16.67%
        - 6 ชม. = 25%
        
        Returns:
            float: ความกว้าง % (0-100)
        """
        return (self.duration_hours / 24) * 100
    
    def get_timeline_color(self):
        """
        กำหนดสีตามช่วงเวลา (สำหรับ UI)
        
        Returns:
            str: HEX color code
        """
        hour = self.start_time.hour
        
        # 🌙 Midnight Sale (00:00-05:00) - สีม่วง
        if 0 <= hour < 6:
            return '#6366f1'  # Indigo
        
        # 🍊 Lunch Flash (11:00-14:00) - สีส้ม
        elif 11 <= hour < 15:
            return '#f97316'  # Orange
        
        # 🌆 Evening Sale (18:00-22:00) - สีเขียว
        elif 18 <= hour < 23:
            return '#10b981'  # Green
        
        # เวลาอื่น ๆ - สีฟ้า (Default)
        else:
            return '#3b82f6'  # Blue


class FlashSaleProduct(models.Model):
    """
    Dedicated Stock for Flash Sale
    """
    flash_sale = models.ForeignKey(FlashSale, on_delete=models.CASCADE, related_name='products')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='flash_sales') 
    
    sale_price = models.DecimalField(max_digits=10, decimal_places=2)
    original_price_snapshot = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True) # ✅ Audit
    
    quantity_limit = models.IntegerField(default=10, help_text="จำนวนสินค้าที่จัดโปร (Total Quota)")
    sold_count = models.IntegerField(default=0)
    reserved_stock = models.IntegerField(default=0, help_text="จำนวนที่ถูกจองรอจ่ายเงิน")
    
    limit_per_user = models.IntegerField(default=1, help_text="จำกัดจำนวนซื้อต่อคน")

    class Meta:
        db_table = 'flash_sale_products'
        unique_together = ('flash_sale', 'product')

    def __str__(self):
        return f"{self.product.title} @ {self.sale_price}"

    def is_available(self):
        return (self.sold_count + self.reserved_stock) < self.quantity_limit and self.flash_sale.status == 'Live'

class StockReservation(models.Model):
    """
    ⏳ Temporary Stock Lock (15 mins)
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    flash_sale_product = models.ForeignKey(FlashSaleProduct, null=True, blank=True, on_delete=models.CASCADE)
    
    quantity = models.IntegerField()
    expires_at = models.DateTimeField(db_index=True) 
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'stock_reservations'
        indexes = [
            models.Index(fields=['expires_at']),
        ]

# ==========================================
# 🗓️ Promotion Schedule & Audit (V2 NEW)
# ==========================================
class PromotionSchedule(models.Model):
    """
    Unified table for Calendar View & Conflict Checking
    """
    PROMO_TYPE_CHOICES = [
        ('coupon', 'Coupon'),
        ('flash_sale', 'Flash Sale'),
    ]
    
    promo_type = models.CharField(max_length=20, choices=PROMO_TYPE_CHOICES)
    promo_id = models.IntegerField(help_text="ID of Coupon or FlashSale")
    
    start_time = models.DateTimeField(db_index=True)
    end_time = models.DateTimeField(db_index=True)
    priority = models.IntegerField(default=0)
    
    # Conflict Scope
    impact_scope = models.JSONField(default=dict, help_text="Scope e.g. {'type': 'global'} or {'type': 'category', 'ids': [1]}")
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'promotion_schedules'
        indexes = [
            models.Index(fields=['start_time', 'end_time']),
        ]

class PromoUsageLog(models.Model):
    """
    Log for Rate Limiting & Audit
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='promo_logs')
    promo_type = models.CharField(max_length=20) # 'coupon' | 'flash'
    promo_id = models.IntegerField()
    order_id = models.IntegerField(null=True, blank=True)
    
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'promo_usage_logs'

# ==========================================
# 📦 Order System (V2)
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
    customer_name = models.CharField(max_length=150)
    customer_tel = models.CharField(max_length=20)
    customer_email = models.CharField(max_length=254, null=True, blank=True)
    shipping_address = models.TextField()
    shipping_province = models.CharField(max_length=100, null=True, blank=True)
    
    # --- Financial Breakdown ---
    item_subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0) # ✅ New
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0) # ✅ New
    
    discount_total = models.DecimalField(max_digits=10, decimal_places=2, default=0) # ✅ Total Discount
    
    # Detailed Discount Tracking
    coupon_discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    flash_sale_discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    total_price = models.DecimalField(max_digits=12, decimal_places=2) # Net Total
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    
    payment_method = models.CharField(max_length=50, default='Transfer')
    payment_slip = models.CharField(max_length=255, null=True, blank=True)
    
    slip_image = models.ImageField(upload_to='slips/', null=True, blank=True)
    payment_date = models.DateTimeField(null=True, blank=True)
    
    # Strict Verification
    transfer_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    transfer_date = models.DateTimeField(null=True, blank=True)
    bank_name = models.CharField(max_length=100, null=True, blank=True)
    transfer_account_number = models.CharField(max_length=50, null=True, blank=True)

    # 🚚 Tracking Info (Phase 8)
    tracking_number = models.CharField(max_length=100, null=True, blank=True)
    courier_name = models.CharField(max_length=100, null=True, blank=True)
    shipped_at = models.DateTimeField(null=True, blank=True)
    
    # 🕒 Status Timestamps (Phase 10)
    processing_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    
    # Legacy Coupon Link (Keep for backward compat, but rely on applied_coupon for V2)
    coupon = models.ForeignKey(Coupon, on_delete=models.SET_NULL, null=True, blank=True, related_name='legacy_orders')
    applied_coupon = models.ForeignKey(UserCoupon, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders') # ✅ V2
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00) # Legacy
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'orders'

    def __str__(self):
        return f"Order #{self.id} - {self.customer_name}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='order_items') 
    quantity = models.PositiveIntegerField(default=1)
    
    # --- Pricing Snapshot (V2) ---
    base_price_at_time = models.DecimalField(max_digits=10, decimal_places=2, default=0) # ✅ New
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2) # Final Price per unit
    
    # --- Promotion Audit ---
    PROMO_SOURCE_CHOICES = [
        ('normal', 'Normal Price'),
        ('flash_sale', 'Flash Sale'),
        ('coupon_prorate', 'Coupon Prorated') 
    ]
    promotion_source = models.CharField(choices=PROMO_SOURCE_CHOICES, max_length=20, default='normal') # ✅ New
    promotion_ref_id = models.IntegerField(null=True, blank=True) # ✅ New (FlashSaleProduct ID or Coupon ID)

    class Meta:
        db_table = 'order_items'

    def __str__(self):
        return f"{self.product.title} (x{self.quantity})"
    
    def get_total_price(self):
        return self.price_at_purchase * self.quantity

class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField(default=5)
    comment = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='reviews/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    reply_comment = models.TextField(blank=True, null=True)
    reply_timestamp = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.product.title} ({self.rating})"

class AdminLog(models.Model):
    admin = models.ForeignKey(User, on_delete=models.CASCADE, related_name='admin_logs')
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(default=timezone.now)
    details = models.TextField(null=True, blank=True)
    ip_address = models.CharField(max_length=45, null=True, blank=True)

    class Meta:
        db_table = 'admin_logs'

# ==========================================
# ❤️ Wishlist System
# ==========================================

class Wishlist(models.Model):
    """
    User's Wishlist (รายการโปรด) - เก็บสินค้าที่ลูกค้าสนใจ
    
    Features:
    - เพิ่ม/ลบสินค้าจาก Wishlist
    - บันทึกราคาตอนเพิ่มเข้า Wishlist (สำหรับ Price Drop Alert)
    - แจ้งเตือนเมื่อราคาลดลง
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlist_items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='wishlisted_by')
    added_date = models.DateTimeField(auto_now_add=True)
    initial_price = models.DecimalField(max_digits=10, decimal_places=2, help_text="ราคาตอนเพิ่มเข้า Wishlist")
    notify_on_drop = models.BooleanField(default=True, help_text="แจ้งเตือนเมื่อราคาลด")
    last_price_check = models.DateTimeField(auto_now=True, help_text="ตรวจสอบราคาล่าสุดเมื่อไหร่")
    
    class Meta:
        db_table = 'wishlist'
        unique_together = ('user', 'product')  # 1 user ต่อ 1 product เท่านั้น
        ordering = ['-added_date']
        indexes = [
            models.Index(fields=['user', '-added_date']),
            models.Index(fields=['product']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.product.title}"
    
    @property
    def current_price(self):
        """ราคาปัจจุบันของสินค้า"""
        return self.product.price
    
    @property
    def price_dropped(self):
        """ตรวจสอบว่าราคาลดลงหรือไม่"""
        return self.current_price < self.initial_price
    
    @property
    def price_drop_percentage(self):
        """เปอร์เซ็นต์ที่ราคาลดลง"""
        if self.price_dropped:
            return ((self.initial_price - self.current_price) / self.initial_price) * 100
        return 0

# ==========================================
# 🤖 Signals & Automation Logic
# ==========================================

@receiver(post_save, sender=Product)
def auto_tag_new_arrival(sender, instance, created, **kwargs):
    """
    ติด Tag 'New Arrival' อัตโนมัติเมื่อสร้างสินค้าใหม่
    """
    if created:
        try:
            # ค้นหาหรือสร้าง Tag 'New Arrival'
            # กำหนดค่าพื้นฐานเป็นสีเขียว Emerald และไอคอน Sparkles
            new_tag, _ = Tag.objects.get_or_create(
                name='New Arrival',
                defaults={
                    'color': '#10b981', 
                    'icon': 'Sparkles', 
                    'group_name': 'สถานะสินค้า'
                }
            )
            instance.tags.add(new_tag)
        except Exception as e:
            # Fail silently to not block product creation
            print(f"Error in auto_tag_new_arrival: {str(e)}")

# ==========================================
# 🍌 Mega Menu Config
# ==========================================
from .models_menu import MegaMenuConfig

# ==========================================
# 🔔 Notification System
# ==========================================
class Notification(models.Model):
    TYPE_CHOICES = [
        ('price_drop', 'Price Drop Alert'),
        ('order_update', 'Order Update'),
        ('system', 'System Message'),
        ('promotion', 'Promotion'),
        ('flash_sale', 'Flash Sale Alert'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='system')
    
    # Optional: Link to related object (e.g. Product ID for price drop)
    related_id = models.IntegerField(null=True, blank=True)
    image_url = models.CharField(max_length=500, null=True, blank=True)
    
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['is_read']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.title}"

# ==========================================
# 🏠 Shipping Address System
# ==========================================
class ShippingAddress(models.Model):
    LABEL_CHOICES = [
        ('Home', 'บ้าน'),
        ('Work', 'ที่ทำงาน'),
        ('Other', 'อื่นๆ'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    receiver_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    address_detail = models.TextField(help_text="บ้านเลขที่, หมู่, อาคาร, ซอย, ถนน")
    sub_district = models.CharField(max_length=100, blank=True, null=True)
    district = models.CharField(max_length=100, blank=True, null=True)
    province = models.CharField(max_length=100)
    zipcode = models.CharField(max_length=10)
    
    label = models.CharField(max_length=20, choices=LABEL_CHOICES, default='Home')
    is_default = models.BooleanField(default=False)
    
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Address Verification
    accuracy = models.CharField(
        max_length=20, 
        blank=True, 
        null=True,
        help_text="Accuracy level: building, house, road, street, city, etc."
    )
    verified = models.BooleanField(
        default=False,
        help_text="User confirmed this is the actual location"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'shipping_addresses'
        ordering = ['-is_default', '-created_at']
        verbose_name_plural = 'Shipping Addresses'

    def save(self, *args, **kwargs):
        # If set as default, unset others
        if self.is_default:
            ShippingAddress.objects.filter(user=self.user, is_default=True).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.label} - {self.receiver_name} ({self.user.username})"
