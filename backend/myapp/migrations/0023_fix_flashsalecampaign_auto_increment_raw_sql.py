# Generated migration to fix AUTO_INCREMENT using RAW SQL

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0022_fix_flashsalecampaign_id_autoincrement'),
    ]

    operations = [
        # ✅ ใช้ RAW SQL แก้ไข AUTO_INCREMENT โดยตรง
        migrations.RunSQL(
            # Forward SQL - แก้ไข id ให้เป็น AUTO_INCREMENT
            sql="""
                ALTER TABLE flash_sale_campaigns 
                MODIFY COLUMN id INT AUTO_INCREMENT PRIMARY KEY;
            """,
            # Reverse SQL - สำหรับ rollback (ถ้าต้องการ)
            reverse_sql="""
                ALTER TABLE flash_sale_campaigns 
                MODIFY COLUMN id INT PRIMARY KEY;
            """
        ),
    ]
