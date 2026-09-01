import axios from 'axios';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import './TrackingPage.css';
import { Link, useParams } from 'react-router';

export function TrackingPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setOrder(null);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/api/orders/${orderId}?expand=products`);
        setOrder(response.data);
      } catch (error) {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <>
        <title>Tracking Page</title>
        <Header />
        <div className="tracking-page">
          <div className="order-tracking">
            <Link className="back-to-orders-link link-primary" to="/orders">
              View all orders
            </Link>
            <div className="delivery-date">Loading tracking details...</div>
          </div>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <title>Tracking Page</title>
        <Header />
        <div className="tracking-page">
          <div className="order-tracking">
            <Link className="back-to-orders-link link-primary" to="/orders">
              View all orders
            </Link>
            <div className="delivery-date">Order not found.</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <title>Tracking Page</title>
      <link rel="icon" type="image/svg+xml" href="tracking-favicon.png" />
      <Header />
      <div className="tracking-page">
        <div className="order-tracking">
          <Link className="back-to-orders-link link-primary" to="/orders">
            View all orders
          </Link>

          <div className="delivery-date">
            Order ID: {order.id}
          </div>

          {order.products.map((orderProduct) => (
            <div key={`${order.id}-${orderProduct.productId}`} className="tracking-product-block">
              <div className="product-info">
                {orderProduct.product.name}
              </div>

              <div className="product-info">
                Quantity: {orderProduct.quantity}
              </div>

              <div className="product-info">
                Arriving on: {dayjs(orderProduct.estimatedDeliveryTimeMs).format('dddd, MMMM D')}
              </div>

              <img
                className="product-image"
                src={orderProduct.product.image}
              />

              <div className="progress-labels-container">
                <div className="progress-label">Preparing</div>
                <div className="progress-label current-status">Shipped</div>
                <div className="progress-label">Delivered</div>
              </div>

              <div className="progress-bar-container">
                <div className="progress-bar"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
