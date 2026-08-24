import axios from 'axios';
import { Routes, Route } from 'react-router';
import { HomePage } from './pages/HomePage';
import { CheckoutPage } from './pages/Checkout/CheckoutPage';
import { OrdersPage } from './pages/OrdersPage';
import { useState, useEffect } from 'react';
import { TrackingPage } from './pages/TrackingPage';
import { NotFoundPage } from './pages/NotFoundPage';
import './App.css'

function App() {

  const [cart, setCart] = useState([]);
  useEffect(() =>{
      axios.get("/api/cart-items")
      .then((response) => {
        setCart(response.data)
      });
  }, []);

  return (
    <Routes>
      <Route index element={<HomePage cart={cart}/>} />
      <Route path="orders" element={<OrdersPage />} />
      <Route path="checkout" element={<CheckoutPage cart={cart} />} />
      <Route path="tracking" element={<TrackingPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
