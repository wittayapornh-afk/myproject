// frontend/src/App.jsx
import { Routes, Route } from 'react-router-dom';
import './App.css'
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import ProductEdit from './components/ProductEdit';
import Navbar from './components/Navbar';
import ProductAdd from './components/ProductAdd';
import CartPage from './components/CartPage';
import CheckoutPage from './components/CheckoutPage';
import HeroSection from './components/HeroSection';
import Footer from './components/Footer'; // ✅ 1. นำเข้า Footer

function App() {
  return (
    <div className="App min-h-screen bg-[#F4F4F0] flex flex-col font-sans"> {/* ปรับ bg และ flex */}
      <Navbar />
      
      <div className="flex-1"> {/* ให้เนื้อหาขยายเต็มพื้นที่ */}
        <Routes>
            <Route path="/" element={
                <>
                    <HeroSection />
                    <ProductList />
                </>
            } />
            <Route path="/product/:id" element={<div className="pt-10"><ProductDetail /></div>} />
            <Route path="/product/add" element={<div className="pt-10"><ProductAdd /></div>} />
            <Route path="/product/edit/:id" element={<div className="pt-10"><ProductEdit /></div>} />
            <Route path="/cart" element={<div className="pt-10"><CartPage /></div>} />
            <Route path="/checkout" element={<div className="pt-10"><CheckoutPage /></div>} />
        </Routes>
      </div>

      <Footer /> {/* ✅ 2. ใส่ Footer ไว้ล่างสุด */}
    </div>
  );
}

export default App;