import shutil
import os

# Paths
views_file = r'c:\Users\HP\Documents\myproject-main\myproject\backend\myapp\views.py'
backup_file = r'c:\Users\HP\Documents\myproject-main\myproject\backend\myapp\views.py.backup'

# Create backup
print(f"Creating backup: {backup_file}")
shutil.copy2(views_file, backup_file)

# Read and fix encoding
print(f"Reading {views_file}")
try:
    with open(views_file, 'rb') as f:
        content = f.read()
    
    # Try to decode with utf-8, replace errors
    text = content.decode('utf-8', errors='replace')
    
    # Write back as clean UTF-8
    print(f"Writing clean UTF-8 version")
    with open(views_file, 'w', encoding='utf-8') as f:
        f.write(text)
    
    print("✅ Encoding fixed successfully!")
    print(f"Backup saved at: {backup_file}")
    
except Exception as e:
    print(f"❌ Error: {e}")
