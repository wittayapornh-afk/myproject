import traceback
import sys
from django.utils.deprecation import MiddlewareMixin

class ErrorDebugMiddleware(MiddlewareMixin):
    """
    middleware สำหรับตรวจจับ Error ที่เกิดขึ้นใน Backend
    หน้าที่: แสดงสาเหตุและตำแหน่งของ Error ออกทาง Console อย่างละเอียด
    """
    
    def process_exception(self, request, exception):
        # 1. ดึงข้อมูล Error (Type, Value, Traceback)
        exc_type, exc_value, exc_traceback = sys.exc_info()
        
        # 2. แกะรอย Traceback เพื่อหาตำแหน่งล่าสุดที่เกิด Error
        # extract_tb คืนค่าเป็น list ของ FrameSummary objects
        tb_list = traceback.extract_tb(exc_traceback)
        
        if tb_list:
            # เอาอันสุดท้าย (Last Frame) ซึ่งคือจุดที่ Error เกิดขึ้นจริง
            last_trace = tb_list[-1]
            filename = last_trace.filename
            line_number = last_trace.lineno
            func_name = last_trace.name
            code_context = last_trace.line

            # 3. แสดงผลออกทาง Console (Terminal)
            print("\n" + "="*60)
            print("🚨 ERROR DETECTED (ตรวจพบข้อผิดพลาด) 🚨")
            print("="*60)
            print(f"📂 File (ไฟล์): {filename}")
            print(f"🔢 Line (บรรทัด): {line_number}")
            print(f"⚙️  Function (ฟังก์ชัน): {func_name}")
            print(f"❌ Cause (สาเหตุ): {exc_value}")
            print(f"📝 Code (โค้ดที่มีปัญหา):")
            print(f"   👉 {code_context}")
            print("="*60 + "\n")

        # ส่งคืน None เพื่อให้ Django จัดการ Error ต่อไปตามปกติ (เช่น ส่ง 500 response)
        # เราแค่ดู Log ไม่ได้ขัดขวางการทำงานระบบ
        return None
