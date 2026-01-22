
import os

file_path = r'c:\Users\HP\Documents\myproject-main\myproject\backend\myapp\views.py'

encodings = ['utf-8', 'cp874', 'latin-1']

content = None
used_encoding = None

for enc in encodings:
    try:
        with open(file_path, 'r', encoding=enc) as f:
            content = f.read()
            used_encoding = enc
            print(f"Successfully read with {enc}")
            break
    except Exception as e:
        print(f"Failed with {enc}: {e}")

if content:
    if 'def login_api' in content:
        print("Found 'def login_api'")
        lines = content.splitlines()
        for i, line in enumerate(lines):
            if 'def login_api' in line:
                print(f"Line {i+1}: {line}")
                # Print next 20 lines
                for j in range(1, 21):
                    if i+j < len(lines):
                        print(f"Line {i+1+j}: {lines[i+j]}")
                break
    else:
        print("'def login_api' NOT found in content")
else:
    print("Could not read file with any encoding")
