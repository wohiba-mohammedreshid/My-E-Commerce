/**
 * Site header with navigation, search, cart badge, and user menu.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  function handleSearch(e) {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setMenuOpen(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/');
    setMenuOpen(false);
  }

  return (
    <header className="header">
      <div className="container header-inner">
        {/* Logo */}
        <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
          <span className="logo-icon">🛒</span>
          <span className="logo-text">ShopWave</span>
        </Link>

        {/* Search bar — hidden on small screens */}
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search products"
          />
          <button type="submit" aria-label="Search">🔍</button>
        </form>

        {/* Navigation */}
        <nav className={`nav ${menuOpen ? 'nav-open' : ''}`}>
          <Link to="/products" onClick={() => setMenuOpen(false)}>Shop</Link>

          {isAuthenticated ? (
            <>
              <Link to="/orders" onClick={() => setMenuOpen(false)}>Orders</Link>
              {isAdmin && (
                <Link to="/admin" onClick={() => setMenuOpen(false)}>Admin</Link>
              )}
              <span className="nav-user">Hi, {user?.displayName || 'User'}</span>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>
                Sign Up
              </Link>
            </>
          )}
        </nav>

        {/* Cart icon with item count badge */}
        <Link to="/cart" className="cart-link" aria-label={`Cart with ${itemCount} items`}>
          🛍️
          {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
        </Link>

        {/* Mobile menu toggle */}
        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
    </header>
  );
}
