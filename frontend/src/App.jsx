import { useState, useEffect} from 'react'
import './App.css'
import ProductList from './components/ProductList';

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // API Endpoint ของ Django (สมมติว่ารันที่ Port 8000)
    fetch('http://localhost:8000/api/people/') 
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <div class = "name">
      <h1>ข้อมูลสินค้า</h1>
      <ul>
        {data.map(person => (
          <li key={person.id}>{person.name} - {person.age} ปี</li>
        ))}
      </ul>
      <ProductList /> 
     
    </div>
  );
}

export default App;
