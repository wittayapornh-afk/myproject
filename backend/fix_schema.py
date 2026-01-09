from django.db import connection, transaction
import traceback

def fix():
    cursor = connection.cursor()
    
    # 1. Create 'tags' table
    try:
        print("Checking/Creating 'tags' table...")
        cursor.execute("SHOW TABLES LIKE 'tags'")
        if not cursor.fetchone():
            cursor.execute("""
                CREATE TABLE tags (
                    id bigint AUTO_INCREMENT NOT NULL PRIMARY KEY,
                    name varchar(50) NOT NULL UNIQUE
                )
            """)
            print("  Created 'tags' table.")
        else:
            print("  'tags' table exists.")
    except Exception as e:
        print(f"Error creating tags: {e}")

    # 2. Add columns to 'products' table
    columns_to_add = [
        ("sku", "varchar(100) NULL UNIQUE"),
        ("weight", "decimal(10,2) NULL"),
        ("width", "decimal(10,2) NULL"),
        ("height", "decimal(10,2) NULL"),
        ("depth", "decimal(10,2) NULL"),
    ]
    
    # Check existing columns
    cursor.execute("DESCRIBE products")
    existing_cols = [row[0] for row in cursor.fetchall()]
    
    for col_name, defn in columns_to_add:
        if col_name not in existing_cols:
            try:
                print(f"Adding column '{col_name}'...")
                cursor.execute(f"ALTER TABLE products ADD COLUMN {col_name} {defn}")
                print(f"  Added '{col_name}'.")
            except Exception as e:
                print(f"  Error adding '{col_name}': {e}")
        else:
            print(f"  Column '{col_name}' already exists.")

    # 3. Create 'products_tags' (M2M) table
    # Standard Django M2M: id, product_id, tag_id + constraints
    try:
        print("Checking/Creating 'products_tags' table...")
        cursor.execute("SHOW TABLES LIKE 'products_tags'")
        if not cursor.fetchone():
            cursor.execute("""
                CREATE TABLE products_tags (
                    id bigint AUTO_INCREMENT NOT NULL PRIMARY KEY,
                    product_id bigint NOT NULL,
                    tag_id bigint NOT NULL,
                    CONSTRAINT fk_pt_product FOREIGN KEY (product_id) REFERENCES products(id),
                    CONSTRAINT fk_pt_tag FOREIGN KEY (tag_id) REFERENCES tags(id),
                    UNIQUE KEY uniq_product_tag (product_id, tag_id)
                )
            """)
            print("  Created 'products_tags' table.")
        else:
            print("  'products_tags' table exists.")
    except Exception as e:
        print(f"Error creating products_tags: {e}")

    print("Schema fix complete.")

fix()
