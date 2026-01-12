
import os
import django
from django.db import connection

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

def fix_orders_id():
    print("Attempting to fix 'orders' table id column...")
    with connection.cursor() as cursor:
        try:
            # Check if using MySQL
            if connection.vendor == 'mysql':
                print("Detected MySQL backend.")
                
                # OPTIONAL: Check if AUTO_INCREMENT is already there (hard with raw SQL portably, but we can just try to apply it)
                
                
                tables_to_fix = [
                    'orders',
                    'order_items', 
                    'admin_logs',
                    'stock_history',
                    'auth_permission',  # Commonly affects permissions
                    'auth_group',
                    'django_content_type'
                ]
                
                for table in tables_to_fix:
                    try:
                        print(f"Fixing table: {table}")
                        sql = f"ALTER TABLE {table} MODIFY id bigint NOT NULL AUTO_INCREMENT;"
                        # Special case for some tables if id is int not bigint?
                        # auth_permission id is int (StartLine 1449 in sql: MODIFY id int NOT NULL)
                        # content_type id is int
                        # django_admin_log id is int
                        
                        if table in ['auth_permission', 'auth_group', 'django_content_type']:
                             sql = f"ALTER TABLE {table} MODIFY id int NOT NULL AUTO_INCREMENT;"
                        
                        print(f"Executing: {sql}")
                        cursor.execute(sql)
                        print(f"Success for {table}")
                    except Exception as inner_e:
                        print(f"Failed to fix {table}: {inner_e}")

                
            else:
                print(f"Detected {connection.vendor} backend. This script is intended for MySQL.")
        except Exception as e:
            print(f"Error executing SQL: {e}")
            import traceback
            traceback.print_exc()

if __name__ == '__main__':
    fix_orders_id()
