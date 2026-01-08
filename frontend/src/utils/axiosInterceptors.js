import axios from 'axios';
import Swal from 'sweetalert2';

// ✅ [ระบบ Error ใหม่] Global Axios Interceptor
// ทำหน้าที่ดักจับ Error จาก API ทุกตัวในระบบ แล้วแสดงผลเป็น Popup ภาษาไทย
export const setupAxiosInterceptors = () => {
    axios.interceptors.response.use(
        (response) => {
            // ถ้าสำเร็จ ก็ส่งข้อมูลกลับไปปกติ
            return response;
        },
        (error) => {
            // ถ้าเกิด Error (เช่น 400, 401, 500)
            
            let title = "เกิดข้อผิดพลาด";
            let htmlContent = "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้";
            let icon = "error";

            if (error.response) {
                // กรณี Server ตอบกลับมาเป็น Error
                const serverData = error.response.data;
                const status = error.response.status;

                if (serverData) {
                    // ถ้ามี Debug Info จาก Backend (ที่เราทำไว้ใน exception_handler.py)
                    if (serverData.debug_info) {
                        const { file, line, message, error_type } = serverData.debug_info;
                        
                        // ✅ แสดงผลรายละเอียดไฟล์และบรรทัดที่ error
                        htmlContent = `
                            <div style="text-align: left; font-size: 14px;">
                                <p><strong>Error Type:</strong> <span style="color: #d32f2f;">${error_type}</span></p>
                                <p><strong>Message:</strong> ${message}</p>
                                <hr style="margin: 10px 0; border: 0; border-top: 1px solid #eee;" />
                                <p><strong>📂 File:</strong> ${file}</p>
                                <p><strong>🔢 Line:</strong> <span style="font-weight: bold; color: #d32f2f;">${line}</span></p>
                            </div>
                        `;
                        title = `❌ Backend Error (${status})`;
                    } else if (serverData.error || serverData.detail) {
                         // กรณี Error ปกติที่ไม่มี Debug Info
                        htmlContent = serverData.error || serverData.detail || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
                    }
                }
            } else if (error.request) {
                // กรณีส่ง request ไปแล้วไม่ได้รับการตอบกลับ (Network Error)
                htmlContent = "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ (Network Error)<br>กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตหรือ Server";
            } else {
                htmlContent = error.message;
            }

            // ✅ แสดง Popup แจ้งเตือน
            Swal.fire({
                title: title,
                html: htmlContent,
                icon: icon,
                confirmButtonText: 'ตกลง',
                confirmButtonColor: '#d32f2f'
            });

            return Promise.reject(error);
        }
    );
    
    console.log("✅ [System] Axios Interceptors Setup Completed");
};
