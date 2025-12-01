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
import HeroSection from './components/HeroSection'; // นำเข้า Hero

function App() {
  return (
    <div className="App min-h-screen bg-[#030014]">
      <Navbar />
      
      <Routes>
        <Route path="/" element={
            <>
                {/* หน้าแรกมี Hero + สินค้า */}
                <HeroSection />
                <ProductList />
            </>
        } />
        
        {/* หน้าอื่นๆ ไม่ต้องมี Hero */}
        <Route path="/product/:id" element={<div className="pt-20"><ProductDetail /></div>} />
        <Route path="/product/add" element={<div className="pt-20"><ProductAdd /></div>} />
        <Route path="/product/edit/:id" element={<div className="pt-20"><ProductEdit /></div>} />
        <Route path="/cart" element={<div className="pt-20"><CartPage /></div>} />
        <Route path="/checkout" element={<div className="pt-20"><CheckoutPage /></div>} />
      </Routes>
    </div>
  );
}

export default App;