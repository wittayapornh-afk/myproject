from django.core.management.base import BaseCommand
from myapp.models import Product, Category

class Command(BaseCommand):
    help = 'Migrates existing Product.category strings to Category model'

    def handle(self, *args, **kwargs):
        products = Product.objects.all()
        count = 0
        self.stdout.write(f"Found {products.count()} products to process.")

        for p in products:
            if p.category:
                cat_name = p.category.strip()
                if not cat_name:
                    continue
                
                # Get or Create Category
                category, created = Category.objects.get_or_create(name=cat_name)
                
                # Update Product
                p.cat_id = category
                p.save()
                count += 1
                if created:
                    self.stdout.write(self.style.SUCCESS(f"Created Category: {cat_name}"))
        
        self.stdout.write(self.style.SUCCESS(f"Successfully migrated {count} products."))
