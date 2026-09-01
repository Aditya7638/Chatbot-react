import axios from "axios";
import { Routes, Route } from "react-router";
import { HomePage } from "./pages/HomePage";
import { CheckoutPage } from "./pages/Checkout/CheckoutPage";
import { OrdersPage } from "./pages/OrdersPage";
import { useState, useEffect } from "react";
import { TrackingPage } from "./pages/TrackingPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import "./App.css";

function App() {
  const [cart, setCart] = useState([]);
  const loadCart = async () => {
    const response = await axios.get("/api/cart-items?expand=product");
    setCart(response.data);
  };

  useEffect(() => {
    loadCart();
  }, []);

  return (
    <Routes>
      <Route index element={<HomePage cart={cart} loadCart={loadCart} />} />
      <Route path="orders" element={<OrdersPage cart={ cart } />} />
      <Route
        path="checkout"
        element={<CheckoutPage cart={cart} setCart={setCart} loadCart={loadCart}/>}
      />
      <Route path="tracking" element={<TrackingPage />} />
      <Route path="tracking/:orderId" element={<TrackingPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
