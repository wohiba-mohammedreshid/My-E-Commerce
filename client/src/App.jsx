/**
 * Main App component — defines all routes and page layout.
 */
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public pages */}
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<ProductDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        {/* Protected pages — require login */}
        <Route path="checkout" element={
          <ProtectedRoute><Checkout /></ProtectedRoute>
        } />
        <Route path="orders" element={
          <ProtectedRoute><Orders /></ProtectedRoute>
        } />
        <Route path="orders/:id" element={
          <ProtectedRoute><OrderDetail /></ProtectedRoute>
        } />

        {/* Admin pages — require admin role */}
        <Route path="admin" element={
          <AdminRoute><AdminDashboard /></AdminRoute>
        } />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
