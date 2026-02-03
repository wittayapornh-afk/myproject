from django.db import models

class MegaMenuConfig(models.Model):
    category = models.OneToOneField('Category', on_delete=models.CASCADE, related_name='menu_config')
    banner_image = models.ImageField(upload_to='menu_banners/', null=True, blank=True)
    promo_text = models.CharField(max_length=255, null=True, blank=True, help_text="Text shown on the banner (optional)")
    button_text = models.CharField(max_length=50, default="ช้อปเลย")
    button_link = models.CharField(max_length=255, blank=True, null=True, help_text="Link for the button (optional)")
    is_featured = models.BooleanField(default=False, help_text="Show in main menu list?")

    def __str__(self):
        return f"Menu Config for {self.category.name}"

    class Meta:
        verbose_name = "Mega Menu Configuration"
        verbose_name_plural = "Mega Menu Configurations"
