
import os
import shutil

src = r"c:\Users\TEST009\Desktop\myproject\backend\media\products\GSMN-APL-17PM256BLTU_7_251020_220200_C5YHC0q.webp"
dst = r"c:\Users\TEST009\Desktop\myproject\backend\media\products\thumb_197.webp"

if os.path.exists(src):
    try:
        if os.path.exists(dst):
            os.remove(dst)
            print(f"Removed existing {dst}")
        
        os.rename(src, dst)
        print(f"Renamed {src} to {dst} successfully")
    except Exception as e:
        print(f"Rename failed: {e}")
else:
    if os.path.exists(dst):
        print("Source not found but Destination exists. Asssuming already renamed.")
    else:
        print(f"Source file not found: {src}")
