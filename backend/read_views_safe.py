
import sys

filename = r'c:\Users\HP\Documents\myproject-main\myproject\backend\myapp\views.py'

try:
    with open(filename, 'rb') as f:
        # Decode with replacement to handle any invalid bytes
        content = f.read().decode('utf-8', 'replace')
        
    print(f"File read successfully. Length: {len(content)}")
    
    lines = content.split('\n')
    found = False
    for i, line in enumerate(lines):
        if 'def login_api' in line:
            print(f"Found login_api at line {i+1}")
            # Print the function (simple heuristic: print until next def or 50 lines)
            for j in range(i, min(i + 50, len(lines))):
                print(f"{j+1}: {lines[j]}")
                if j > i and lines[j].startswith('def '):
                    break
            found = True
            break
            
    if not found:
        print("login_api function not found.")
        
except Exception as e:
    print(f"Error reading file: {e}")
