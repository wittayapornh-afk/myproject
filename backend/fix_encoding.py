import shutil
import os

file_path = r'c:\Users\HP\Documents\myproject-main\myproject\backend\myapp\views.py'
backup_path = file_path + '.bak'

print(f"Attempting to fix encoding for: {file_path}")

try:
    # Try reading with cp874 (Windows Thai)
    with open(file_path, 'r', encoding='cp874') as f:
        content = f.read()
    
    print("Read file successfully with cp874 encoding.")
    
    # Create backup
    shutil.copy(file_path, backup_path)
    print(f"Created backup at: {backup_path}")
    
    # Write back as utf-8
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Successfully converted {file_path} to UTF-8.")
    
except UnicodeDecodeError:
    print("Failed to decode with cp874. The file might be in another encoding (e.g., utf-16).")
except Exception as e:
    print(f"An error occurred: {e}")
