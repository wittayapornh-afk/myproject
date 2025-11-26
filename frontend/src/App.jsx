import './App.css'
import ProductList from './components/ProductList';

function App() {
  return (
    <div className="App">
      <h1>ยินดีต้อนรับสู่ร้านค้าของฉัน</h1>
      {/* เรียกใช้ Component แสดงรายการสินค้า */}
      <ProductList /> 
    </div>
  );
}

export default App;