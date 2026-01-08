from rest_framework.views import exception_handler
from rest_framework.response import Response
import traceback
import sys

def custom_exception_handler(exc, context):
    """
    ✅ [ระบบ Error ใหม่] Custom Exception Handler
    ฟังก์ชันนี้จะทำงานเมื่อเกิด Error ขึ้นใน API
    หน้าที่: ดึงข้อมูลไฟล์และบรรทัดที่เกิด Error เพื่อส่งกลับไปให้ Frontend หรือแสดงใน Debug
    """
    
    # 1. เรียกใช้ Default Handler ของ DRF ก่อนเพื่อให้จัดการเรื่อง Auth/Validation ปกติ
    response = exception_handler(exc, context)

    # 2. ถ้า response เป็น None แสดงว่าเป็น Error ที่ DRF ไม่ได้จัดการ (เช่น 500 Server Error, ZeroDivisionError)
    # หรือถ้าเราอยากเพิ่มข้อมูลเข้าไปใน Error ปกติด้วย
    if response is None:
        # กรณี 500 Error หรือ Unhandled Exception
        response = Response({
            "error": "Internal Server Error",
            "detail": str(exc)
        }, status=500)

    # 3. ดึงข้อมูลว่า Error เกิดที่ไฟล์ไหน บรรทัดไหน (Traceback)
    # sys.exc_info() คืนค่า (type, value, traceback)
    exc_type, exc_value, exc_traceback = sys.exc_info()
    
    if exc_traceback:
        # ดึง Stack สุตท้ายที่เกิด Error (จุดที่พังจริงๆ)
        tb_last = traceback.extract_tb(exc_traceback)[-1]
        filename = tb_last.filename
        lineno = tb_last.lineno
        funcname = tb_last.name
        
        # 4. เพิ่มข้อมูล Debug ลงไปใน Response (เฉพาะตอน Debug หรือถ้าจะโชว์ให้ Admin เห็น)
        # ✅ [เพิ่ม] แจ้งชื่อไฟล์และบรรทัดที่ error
        if response.data is not None and isinstance(response.data, dict):
             response.data['debug_info'] = {
                "error_type": exc.__class__.__name__,
                "message": str(exc),
                "file": filename,       # 📂 ไฟล์ที่เกิดปัญหา
                "line": lineno,         # 🔢 บรรทัดที่เกิดปัญหา
                "function": funcname    # 🔧 ฟังก์ชันที่เกิดปัญหา
            }
        
        # ✅ [เพิ่ม] Print ลง Console ฝั่ง Server ด้วยเพื่อให้เห็นชัดๆ
        print(f"\n❌ [Backend Error] Type: {exc.__class__.__name__}")
        print(f"   📂 File: {filename}")
        print(f"   🔢 Line: {lineno}")
        print(f"   🔧 Func: {funcname}")
        print(f"   💬 Msg:  {str(exc)}\n")

    return response
