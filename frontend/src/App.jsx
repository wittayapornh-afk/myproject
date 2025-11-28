import { Routes, Route } from 'react-router-dom'; // นำเข้า
import './App.css'
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail'; // นำเข้าหน้าใหม่
import ProductEdit from './components/ProductEdit';
import Navbar from './components/Navbar';
import ProductAdd from './components/ProductAdd';
import CartPage from './components/CartPage';
import CheckoutPage from './components/CheckoutPage';

function App() {
  return (
    <div className="App">
      <Navbar />
      {/* ลบ h1 ออกก็ได้ ถ้าอยากให้หน้า Cart ดูคลีนๆ */}
      
      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/product/add" element={<ProductAdd />} />
        <Route path="/product/edit/:id" element={<ProductEdit />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        
        {/* 👇 2. เพิ่มเส้นทางนี้ */}
        <Route path="/cart" element={<CartPage />} />
      </Routes>
    </div>
  );
}



export default App;