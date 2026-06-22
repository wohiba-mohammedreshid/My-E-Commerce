/**
 * Site footer with links and install prompt for PWA.
 */
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="logo-icon">🛒</span>
          <strong>ShopWave</strong>
          <p>Your favorite online shopping destination. Works offline too!</p>
        </div>

        <div className="footer-links">
          <h4>Shop</h4>
          <Link to="/products">All Products</Link>
          <Link to="/products?category=electronics">Electronics</Link>
          <Link to="/products?category=clothing">Clothing</Link>
          <Link to="/products?category=home">Home</Link>
        </div>

        <div className="footer-links">
          <h4>Account</h4>
          <Link to="/login">Login</Link>
          <Link to="/register">Sign Up</Link>
          <Link to="/orders">Order History</Link>
        </div>

        <div className="footer-links">
          <h4>Learn</h4>
          <p className="footer-note">
            Built with React, Express, and Firebase.
            A beginner-friendly PWA tutorial project.
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} ShopWave. Built for learning.</p>
        </div>
      </div>
    </footer>
  );
}
