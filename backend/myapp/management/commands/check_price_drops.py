from django.core.management.base import BaseCommand
from myapp.models import Wishlist, Notification
from django.utils import timezone
from datetime import timedelta

class Command(BaseCommand):
    help = 'Check for price drops in wishlist items'

    def handle(self, *args, **kwargs):
        self.stdout.write("🔎 Checking for price drops...")
        
        # 1. Get all wishlist items where user wants notifications
        items = Wishlist.objects.filter(notify_on_drop=True)
        count = 0
        
        for item in items:
            current_price = item.product.price
            
            # 2. Check overlap logic (Don't spam)
            # Find if we already sent a price drop alert for this product to this user TODAY
            last_24h = timezone.now() - timedelta(hours=24)
            recent_notif = Notification.objects.filter(
                user=item.user,
                type='price_drop',
                related_id=item.product.id,
                created_at__gte=last_24h
            ).exists()
            
            if recent_notif:
                continue

            # 3. Check Price Drop Condition
            # Alert if price is lower than initial added price
            # Optional: You could also check against "last_checked_price" if you added that field
            if current_price < item.initial_price:
                # Calculate drop amount
                diff = item.initial_price - current_price
                percent = (diff / item.initial_price) * 100
                
                # Only alert if drop > 1% (avoid noise)
                if percent >= 1:
                    Notification.objects.create(
                        user=item.user,
                        title='🔥 สินค้าราคาลง!',
                        message=f"สินค้า '{item.product.title}' ลดราคาเหลือ ฿{current_price:,.2f} (จากปกติ ฿{item.initial_price:,.2f}) ประหยัด ฿{diff:,.2f} ({percent:.0f}%) รีบจัดเลย!",
                        type='price_drop',
                        related_id=item.product.id,
                        image_url=item.product.thumbnail.url if item.product.thumbnail else None
                    )
                    count += 1
                    self.stdout.write(self.style.SUCCESS(f"   -> Alert sent to {item.user.username} for {item.product.title}"))
        
        self.stdout.write(self.style.SUCCESS(f'✅ Done. Sent {count} notifications.'))
