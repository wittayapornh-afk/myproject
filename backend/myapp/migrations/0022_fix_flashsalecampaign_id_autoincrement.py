# Generated migration to fix AUTO_INCREMENT issue

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0021_add_flash_sale_campaign'),
    ]

    operations = [
        # ✅ Fix: กำหนด id เป็น AutoField อย่างชัดเจน
        migrations.AlterField(
            model_name='flashsalecampaign',
            name='id',
            field=models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
    ]
