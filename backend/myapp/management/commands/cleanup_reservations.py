from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db.models import F
from myapp.models import StockReservation, FlashSaleProduct

class Command(BaseCommand):
    help = 'Cleans up expired stock reservations and returns usage to pool.'

    def handle(self, *args, **options):
        now = timezone.now()
        expired_reservations = StockReservation.objects.filter(expires_at__lte=now)
        
        count = expired_reservations.count()
        if count == 0:
            self.stdout.write(self.style.SUCCESS('No expired reservations found.'))
            return

        self.stdout.write(f"Found {count} expired reservations. Cleaning up...")

        # Process Flash Sale Reservations specifically
        # We need to decrement reserved_stock on the FS product
        fs_reservations = expired_reservations.filter(flash_sale_product__isnull=False)
        
        for res in fs_reservations:
            fs_prod = res.flash_sale_product
            qty = res.quantity
            
            # Decrement reserved stock safely
            # Note: Checking if > 0 is good but F() might go negative if db inconsistent. 
            # We assume it's correct.
            fs_prod.reserved_stock = F('reserved_stock') - qty
            fs_prod.save()
            
        # Bulk Delete all expired (Normal & Flash Sale)
        deleted_count, _ = expired_reservations.delete()

        self.stdout.write(self.style.SUCCESS(f'Successfully cleaned up {deleted_count} expired reservations.'))
