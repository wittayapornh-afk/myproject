
path = 'myapp/views.py'
try:
    with open(path, 'rb') as f:
        content = f.read()
    
    if b'\x00' in content:
        print(f"Fixing {path} (Size: {len(content)} bytes)")
        new_content = content.replace(b'\x00', b'')
        with open(path, 'wb') as f:
            f.write(new_content)
        print(f"Fixed! New Size: {len(new_content)} bytes")
    else:
        print(f"{path} has no null bytes.")

except Exception as e:
    print(f"Error: {e}")
