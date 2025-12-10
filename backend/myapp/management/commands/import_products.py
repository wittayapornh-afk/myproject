import requests
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from myapp.models import Product, ProductImage

class Command(BaseCommand):
    help = 'Import ALL products from dummyjson.com'

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting import all products...")

        # 1. ล้างข้อมูลเก่าทิ้ง (เพื่อให้ข้อมูลไม่ซ้ำ)
        # ถ้าต้องการเก็บของเดิมไว้ ให้คอมเมนต์บรรทัดนี้ทิ้ง
        Product.objects.all().delete()
        self.stdout.write("Deleted old products.")

        # Header ปลอมตัวเป็น Browser
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }

        # ✅ limit=0 คือดึงทั้งหมด (DummyJSON รองรับ)
        url = "https://dummyjson.com/products?limit=0"
        
        try:
            response = requests.get(url, headers=headers, timeout=15)
            
            if response.status_code != 200:
                self.stdout.write(self.style.ERROR(f'Failed to fetch API. Status: {response.status_code}'))
                return

            data = response.json().get('products', [])
            total = len(data)
            self.stdout.write(f"Found {total} products. Processing...")

            for i, item in enumerate(data):
                self.stdout.write(f"[{i+1}/{total}] Importing: {item['title']}")

                # สร้างสินค้า
                product = Product.objects.create(
                    title=item['title'],
                    description=item['description'],
                    category=item['category'],
                    price=item['price'],
                    rating=item['rating'],
                    stock=item['stock'],
                    brand=item.get('brand', 'Unknown'),
                )

                # โหลดรูปปก (Thumbnail)
                if item.get('thumbnail'):
                    try:
                        img_resp = requests.get(item['thumbnail'], headers=headers, timeout=5)
                        if img_resp.status_code == 200:
                            file_name = f"thumb_{product.id}.jpg"
                            product.thumbnail.save(file_name, ContentFile(img_resp.content), save=True)
                    except Exception as e:
                        self.stdout.write(self.style.WARNING(f"  - Skip thumbnail: {e}"))

                # โหลดรูป Gallery
                for index, img_url in enumerate(item.get('images', [])):
                    try:
                        img_resp = requests.get(img_url, headers=headers, timeout=5)
                        if img_resp.status_code == 200:
                            product_img = ProductImage(product=product)
                            file_name = f"gallery_{product.id}_{index}.jpg"
                            product_img.image.save(file_name, ContentFile(img_resp.content), save=True)
                    except Exception as e:
                        self.stdout.write(self.style.WARNING(f"  - Skip image {index}: {e}"))

            self.stdout.write(self.style.SUCCESS(f'Successfully imported {total} products!'))

        except requests.exceptions.RequestException as e:
            self.stdout.write(self.style.ERROR(f'Network Error: {e}'))