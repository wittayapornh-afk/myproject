# Fix AUTO_INCREMENT without redefining PRIMARY KEY

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0023_fix_flashsalecampaign_auto_increment_raw_sql'),
    ]

    operations = [
        # ✅ แก้ไข: ใช้ MODIFY แต่ไม่กำหนด PRIMARY KEY ซ้ำ
        migrations.RunSQL(
            sql="""
                ALTER TABLE flash_sale_campaigns 
                MODIFY COLUMN id INT AUTO_INCREMENT;
            """,
            reverse_sql="""
                ALTER TABLE flash_sale_campaigns 
                MODIFY COLUMN id INT;
            """
        ),
    ]
