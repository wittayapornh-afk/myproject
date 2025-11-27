import { Routes, Route } from 'react-router-dom'; // นำเข้า
import './App.css'
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail'; // นำเข้าหน้าใหม่

function App() {
  return (
    <div className="App">
      <h1>ยินดีต้อนรับสู่ร้านค้าของฉัน</h1>
      
      <Routes>
        {/* หน้าแรก Show รายการสินค้า */}
        <Route path="/" element={<ProductList />} />
        
        {/* หน้ารายละเอียด (รับ id) */}
        <Route path="/product/:id" element={<ProductDetail />} />
      </Routes>
    </div>
  );
}

export default App;