/**
 * Orders Page — user's order history list.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const STATUS_COLORS = {
  pending: 'status-pending',
  confirmed: 'status-confirmed',
  shipped: 'status-shipped',
  delivered: 'status-delivered',
  cancelled: 'status-cancelled',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.getAll().then(setOrders).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading orders..." />;

  return (
    <div className="orders-page">
      <div className="container">
        <h1 className="page-title">My Orders</h1>

        {orders.length === 0 ? (
          <div className="empty-state">
            <p>You haven't placed any orders yet.</p>
            <Link to="/products" className="btn btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <Link key={order.id} to={`/orders/${order.id}`} className="order-card">
                <div className="order-card-header">
                  <div>
                    <strong>Order #{order.trackingNumber}</strong>
                    <span className="order-date">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`status-badge ${STATUS_COLORS[order.status]}`}>
                    {order.status}
                  </span>
                </div>
                <div className="order-card-body">
                  <p>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                  <p className="order-total">${order.total.toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
