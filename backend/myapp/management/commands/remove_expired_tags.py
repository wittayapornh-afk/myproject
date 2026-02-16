"""
Django Management Command: Remove Expired Tags
Usage: python manage.py remove_expired_tags

This command automatically removes tags that have passed their expiration_date.
Can be scheduled with cron or celery beat.
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from myapp.models import Tag


class Command(BaseCommand):
    help = 'Remove tags that have passed their expiration date'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting',
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
        
        # Find expired tags
        expired_tags = Tag.objects.filter(
            expiration_date__isnull=False,
            expiration_date__lt=now
        )
        
        count = expired_tags.count()
        
        if count == 0:
            self.stdout.write(
                self.style.SUCCESS('✅ No expired tags found.')
            )
            return
        
        if verbose or dry_run:
            self.stdout.write(
                self.style.WARNING(f'📋 Found {count} expired tag(s):')
            )
            for tag in expired_tags:
                self.stdout.write(
                    f'  - {tag.name} ({tag.get_group_name_display()}) '
                    f'expired on {tag.expiration_date.strftime("%Y-%m-%d %H:%M")}'
                )
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    f'⚠️  DRY RUN: Would delete {count} tag(s). '
                    'Run without --dry-run to actually delete.'
                )
            )
        else:
            # Delete expired tags
            deleted = expired_tags.delete()
            self.stdout.write(
                self.style.SUCCESS(
                    f'✅ Successfully removed {count} expired tag(s)'
                )
            )
            
            if verbose:
                self.stdout.write(
                    f'   Deleted objects: {deleted}'
                )
