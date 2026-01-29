from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0024_fix_auto_increment_only'),
    ]

    operations = [
        # ✅ Fix for orders table
        migrations.RunSQL(
            sql="""
                SET FOREIGN_KEY_CHECKS=0;
                ALTER TABLE orders 
                MODIFY COLUMN id BIGINT AUTO_INCREMENT;
                SET FOREIGN_KEY_CHECKS=1;
            """,
            reverse_sql="""
                SET FOREIGN_KEY_CHECKS=0;
                ALTER TABLE orders 
                MODIFY COLUMN id BIGINT;
                SET FOREIGN_KEY_CHECKS=1;
            """
        ),
        # ✅ Fix for order_items table
        migrations.RunSQL(
            sql="""
                SET FOREIGN_KEY_CHECKS=0;
                ALTER TABLE order_items 
                MODIFY COLUMN id BIGINT AUTO_INCREMENT;
                SET FOREIGN_KEY_CHECKS=1;
            """,
            reverse_sql="""
                SET FOREIGN_KEY_CHECKS=0;
                ALTER TABLE order_items 
                MODIFY COLUMN id BIGINT;
                SET FOREIGN_KEY_CHECKS=1;
            """
        ),
    ]
