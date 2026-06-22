/**
 * Shopping Cart Page — view, update quantities, and proceed to checkout.
 */
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const { items, subtotal, shipping, total, updateQuantity, removeItem } = useCart();
  const { isAuthenticated } = useAuth();

  if (items.length === 0) {
    return (
      <div className="container empty-state">
        <h1>Your Cart is Empty</h1>
        <p>Looks like you haven't added anything yet.</p>
        <Link to="/products" className="btn btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="page-title">Shopping Cart ({items.length} items)</h1>

        <div className="cart-layout">
          {/* Cart Items */}
          <div className="cart-items">
            {items.map((item) => (
              <div key={item.productId} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-item-image" />
                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p className="cart-item-price">${item.price.toFixed(2)} each</p>
                </div>
                <div className="quantity-selector">
                  <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
                </div>
                <p className="cart-item-total">${(item.price * item.quantity).toFixed(2)}</p>
                <button
                  className="btn btn-ghost btn-sm cart-remove"
                  onClick={() => removeItem(item.productId)}
                  aria-label={`Remove ${item.name}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <aside className="cart-summary">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
            </div>
            {subtotal < 50 && subtotal > 0 && (
              <p className="shipping-note">Add ${(50 - subtotal).toFixed(2)} more for free shipping!</p>
            )}
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            {isAuthenticated ? (
              <Link to="/checkout" className="btn btn-primary btn-block btn-lg">
                Proceed to Checkout
              </Link>
            ) : (
              <Link to="/login" state={{ from: { pathname: '/checkout' } }} className="btn btn-primary btn-block btn-lg">
                Login to Checkout
              </Link>
            )}

            <Link to="/products" className="btn btn-ghost btn-block">Continue Shopping</Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
