import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    // ✅ [ระบบ Error ใหม่] State สำหรับเก็บค่า Error
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  // Lifecycle นี้ถูกเรียกเมื่อเกิด Error ใน Child Component
  static getDerivedStateFromError(error) {
    // อัพเดท State เพื่อให้ Render UI สำหรับ Error
    return { hasError: true };
  }

  // Lifecycle นี้ใช้สำหรับ Log Error (ส่งไป Server หรือแสดงผล)
  componentDidCatch(error, errorInfo) {
    // ✅ [ระบบ Error ใหม่] เก็บข้อมูล Error อย่างละเอียด
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // แสดงลง Console Browser ให้ Developer เห็นชัดๆ
    console.error("❌ [Frontend Error Boundary Caught]:", error);
    console.error("📂 Component Stack:", errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      // ✅ [ระบบ Error ใหม่] UI ที่จะแสดงเมื่อเกิด Error (แทนหน้าจอขาว)
      return (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#fff0f0', minHeight: '100vh', color: '#333' }}>
          <h1 style={{ color: '#d32f2f' }}>⚠️ เกิดข้อผิดพลาด (Something went wrong)</h1>
          <p>ขออภัย ระบบเกิดข้อผิดพลาดในการทำงาน</p>
          
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '20px', textAlign: 'left', backgroundColor: '#fff', padding: '20px', border: '1px solid #ffcdd2', borderRadius: '8px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: '#d32f2f' }}>
              🔧 กดเพื่อดูรายละเอียด Error (สำหรับ Developer)
            </summary>
            
            <br />
            <strong>Error Message:</strong> {this.state.error && this.state.error.toString()}
            <br /><br />
            <strong>Component Stack:</strong>
            <pre style={{ fontSize: '12px', color: '#555', overflowX: 'auto' }}>
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </details>

          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#d32f2f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
          >
            🔄 รีโหลดหน้าเว็บ
          </button>
        </div>
      );
    }

    // ถ้าไม่มี Error ก็แสดงเนื้อหาปกติ
    return this.props.children; 
  }
}

export default ErrorBoundary;
