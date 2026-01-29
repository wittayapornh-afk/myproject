
import os
import sys
import django
from django.db import connection

# Add the project directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'myproject'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

def inspect_db():
    with connection.cursor() as cursor:
        try:
            print("--- Checking 'order_items' table ---")
            cursor.execute("SHOW CREATE TABLE order_items;")
            row = cursor.fetchone()
            print(row[1])

            print("\n--- Describe 'order_items' ---")
            cursor.execute("DESCRIBE order_items;")
            columns = cursor.fetchall()
            for col in columns:
                print(col)
                
        except Exception as e:
            print(f"Error accessing DB: {e}")

if __name__ == "__main__":
    inspect_db()
