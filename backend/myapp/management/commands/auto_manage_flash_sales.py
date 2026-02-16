"""
Django Management Command: Auto-Activate/Deactivate Flash Sales
Usage: python manage.py auto_manage_flash_sales

This command automatically activates and deactivates Flash Sales based on their schedule.
Should be scheduled to run every minute with cron or celery beat.
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from myapp.models import FlashSale, AdminLog
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Automatically activate and deactivate Flash Sales based on their schedule'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be changed without actually changing',
        )
        parser.add_argument(
            '--verbose',
            action='store_true',
            help='Show detailed output',
        )

    def handle(self, *args, **options):
        dry_run = options.get('dry_run', False)
        verbose = options.get('verbose', False)
        
        now = timezone.now()
        
        # Find Flash Sales that should be activated
        to_activate = FlashSale.objects.filter(
            is_active=False,
            start_time__lte=now,
            end_time__gte=now
        )
        
        # Find Flash Sales that should be deactivated
        to_deactivate = FlashSale.objects.filter(
            is_active=True,
            end_time__lt=now
        )
        
        activate_count = to_activate.count()
        deactivate_count = to_deactivate.count()
        
        if activate_count == 0 and deactivate_count == 0:
            if verbose:
                self.stdout.write(
                    self.style.SUCCESS('✅ No Flash Sales need status changes.')
                )
            return
        
        # Show what will be changed
        if verbose or dry_run:
            if activate_count > 0:
                self.stdout.write(
                    self.style.WARNING(f'\n📈 Flash Sales to ACTIVATE ({activate_count}):')
                )
                for fs in to_activate:
                    self.stdout.write(
                        f'  - [{fs.id}] {fs.name} '
                        f'(Started: {fs.start_time.strftime("%Y-%m-%d %H:%M")})'
                    )
            
            if deactivate_count > 0:
                self.stdout.write(
                    self.style.WARNING(f'\n📉 Flash Sales to DEACTIVATE ({deactivate_count}):')
                )
                for fs in to_deactivate:
                    self.stdout.write(
                        f'  - [{fs.id}] {fs.name} '
                        f'(Ended: {fs.end_time.strftime("%Y-%m-%d %H:%M")})'
                    )
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    f'\n⚠️  DRY RUN: Would change {activate_count + deactivate_count} Flash Sale(s). '
                    'Run without --dry-run to apply changes.'
                )
            )
        else:
            # Get or create system user for logging
            system_user = User.objects.filter(username='system').first() or \
                         User.objects.filter(is_superuser=True).first()
            
            # Activate Flash Sales
            if activate_count > 0:
                to_activate.update(is_active=True)
                if system_user:
                    for fs in to_activate:
                        AdminLog.objects.create(
                            admin=system_user,
                            action=f"Auto-activated Flash Sale: {fs.name} (ID: {fs.id})"
                        )
                self.stdout.write(
                    self.style.SUCCESS(
                        f'✅ Activated {activate_count} Flash Sale(s)'
                    )
                )
            
            # Deactivate Flash Sales
            if deactivate_count > 0:
                # Only deactivate if auto_disable_on_end is True (if field exists)
                for fs in to_deactivate:
                    if hasattr(fs, 'auto_disable_on_end') and not fs.auto_disable_on_end:
                        continue  # Skip if auto-disable is turned off
                    
                    fs.is_active = False
                    fs.save()
                    
                    if system_user:
                        AdminLog.objects.create(
                            admin=system_user,
                            action=f"Auto-deactivated Flash Sale: {fs.name} (ID: {fs.id})"
                        )
                
                self.stdout.write(
                    self.style.SUCCESS(
                        f'✅ Deactivated {deactivate_count} Flash Sale(s)'
                    )
                )
            
            if verbose:
                self.stdout.write(
                    f'\n📊 Summary:'
                )
                self.stdout.write(
                    f'   Activated: {activate_count}'
                )
                self.stdout.write(
                    f'   Deactivated: {deactivate_count}'
                )
