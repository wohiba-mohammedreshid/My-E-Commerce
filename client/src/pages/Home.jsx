/**
 * Home Page — hero section, featured products, and category links.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productApi, categoryApi } from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { subscribeToPush } from '../services/notifications';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [products, cats] = await Promise.all([
          productApi.getAll({ featured: 'true' }),
          categoryApi.getAll(),
        ]);
        setFeatured(products);
        setCategories(cats);
      } catch (error) {
        console.error('Failed to load home data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function handleEnableNotifications() {
    const success = await subscribeToPush();
    alert(success ? 'Notifications enabled! You\'ll get updates on orders and offers.' : 'Could not enable notifications.');
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-content">
          <h1>Shop Smarter with <span className="text-gradient">ShopWave</span></h1>
          <p>Discover amazing products. Works offline. Get notified about deals.</p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary btn-lg">Browse Products</Link>
            <button className="btn btn-outline btn-lg" onClick={handleEnableNotifications}>
              🔔 Enable Notifications
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Shop by Category</h2>
          <div className="category-grid">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className="category-card"
              >
                <span className="category-icon">{cat.icon}</span>
                <span className="category-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section section-alt">
        <div className="container">
          <h2 className="section-title">Featured Products</h2>
          {loading ? (
            <LoadingSpinner message="Loading products..." />
          ) : (
            <div className="product-grid">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          <div className="section-cta">
            <Link to="/products" className="btn btn-outline">View All Products</Link>
          </div>
        </div>
      </section>

      {/* PWA Features Banner */}
      <section className="section">
        <div className="container">
          <div className="features-banner">
            <div className="feature-item">
              <span className="feature-icon">📱</span>
              <h3>Install as App</h3>
              <p>Add to your home screen for a native app experience.</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📡</span>
              <h3>Works Offline</h3>
              <p>Browse cached products even without internet.</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔔</span>
              <h3>Push Alerts</h3>
              <p>Get notified about order updates and special offers.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
