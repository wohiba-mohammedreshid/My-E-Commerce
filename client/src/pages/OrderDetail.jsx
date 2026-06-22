/**
 * Order Detail Page — tracking timeline and order items.
 */
import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { orderApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function OrderDetail() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const justPlaced = location.state?.justPlaced;

  useEffect(() => {
    orderApi.getById(id).then(setOrder).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner message="Loading order..." />;
  if (!order) {
    return (
      <div className="container empty-state">
        <h2>Order not found</h2>
        <Link to="/orders" className="btn btn-primary">Back to Orders</Link>
      </div>
    );
  }

  return (
    <div className="order-detail-page">
      <div className="container">
        {justPlaced && (
          <div className="alert alert-success">
            🎉 Order placed successfully! Your tracking number is <strong>{order.trackingNumber}</strong>
          </div>
        )}

        <nav className="breadcrumb">
          <Link to="/orders">Orders</Link> / <span>#{order.trackingNumber}</span>
        </nav>

        <div className="order-detail-header">
          <h1>Order #{order.trackingNumber}</h1>
          <span className={`status-badge status-${order.status}`}>{order.status}</span>
        </div>

        <div className="order-detail-layout">
          {/* Tracking Timeline */}
          <section className="tracking-section">
            <h2>Order Tracking</h2>
            <div className="tracking-timeline">
              {order.statusHistory?.map((entry, i) => (
                <div key={i} className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <strong>{entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}</strong>
                    <span>{new Date(entry.date).toLocaleString()}</span>
                    {entry.note && <p>{entry.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Order Items */}
          <section className="order-items-section">
            <h2>Items</h2>
            {order.items.map((item, i) => (
              <div key={i} className="order-item">
                <img src={item.image} alt={item.name} />
                <div>
                  <p><strong>{item.name}</strong></p>
                  <p>Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                </div>
                <p>${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}

            <div className="order-totals">
              <div className="summary-row summary-total">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </section>

          {/* Shipping Info */}
          <section className="shipping-info-section">
            <h2>Shipping To</h2>
            <p>{order.shipping.fullName}</p>
            <p>{order.shipping.address}</p>
            <p>{order.shipping.city}, {order.shipping.state} {order.shipping.zip}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
