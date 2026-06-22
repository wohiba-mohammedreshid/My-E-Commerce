/**
 * Admin Dashboard — manage products, categories, orders, and send notifications.
 */
import { useState, useEffect } from 'react';
import { productApi, categoryApi, orderApi, notificationApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AdminDashboard() {
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', category: '', image: '', stock: '', featured: false,
  });
  const [categoryForm, setCategoryForm] = useState({ name: '', icon: '' });
  const [notificationForm, setNotificationForm] = useState({ title: '', body: '', url: '/' });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, [tab]);

  async function loadData() {
    setLoading(true);
    try {
      if (tab === 'products') {
        const [prods, cats] = await Promise.all([productApi.getAll(), categoryApi.getAll()]);
        setProducts(prods);
        setCategories(cats);
      } else if (tab === 'orders') {
        setOrders(await orderApi.getAll());
      } else if (tab === 'categories') {
        setCategories(await categoryApi.getAll());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function showMessage(msg) {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  }

  // --- Product CRUD ---
  async function handleProductSubmit(e) {
    e.preventDefault();
    try {
      const data = {
        ...productForm,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
      };
      if (editingId) {
        await productApi.update(editingId, data);
        showMessage('Product updated!');
      } else {
        await productApi.create(data);
        showMessage('Product created!');
      }
      setProductForm({ name: '', description: '', price: '', category: '', image: '', stock: '', featured: false });
      setEditingId(null);
      loadData();
    } catch (error) {
      showMessage(error.message);
    }
  }

  function startEditProduct(product) {
    setEditingId(product.id);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      stock: product.stock,
      featured: product.featured,
    });
  }

  async function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;
    await productApi.delete(id);
    showMessage('Product deleted');
    loadData();
  }

  // --- Category CRUD ---
  async function handleCategorySubmit(e) {
    e.preventDefault();
    try {
      await categoryApi.create(categoryForm);
      setCategoryForm({ name: '', icon: '' });
      showMessage('Category created!');
      loadData();
    } catch (error) {
      showMessage(error.message);
    }
  }

  // --- Order Status ---
  async function updateOrderStatus(orderId, status) {
    try {
      await orderApi.updateStatus(orderId, { status, note: `Status changed to ${status}` });
      showMessage(`Order updated to ${status}`);
      loadData();
    } catch (error) {
      showMessage(error.message);
    }
  }

  // --- Notifications ---
  async function handleBroadcast(e) {
    e.preventDefault();
    try {
      const result = await notificationApi.broadcast(notificationForm);
      showMessage(result.message);
      setNotificationForm({ title: '', body: '', url: '/' });
    } catch (error) {
      showMessage(error.message);
    }
  }

  return (
    <div className="admin-page">
      <div className="container">
        <h1 className="page-title">Admin Dashboard</h1>

        {message && <div className="alert alert-success">{message}</div>}

        {/* Tab Navigation */}
        <div className="admin-tabs">
          {['products', 'categories', 'orders', 'notifications'].map((t) => (
            <button
              key={t}
              className={`admin-tab ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {loading ? <LoadingSpinner /> : (
          <>
            {/* Products Tab */}
            {tab === 'products' && (
              <div className="admin-section">
                <form onSubmit={handleProductSubmit} className="admin-form">
                  <h2>{editingId ? 'Edit Product' : 'Add Product'}</h2>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Name</label>
                      <input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>Price ($)</label>
                      <input type="number" step="0.01" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} rows={2} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Category</label>
                      <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} required>
                        <option value="">Select...</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Stock</label>
                      <input type="number" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>Image URL</label>
                      <input value={productForm.image} onChange={(e) => setProductForm({ ...productForm, image: e.target.value })} />
                    </div>
                  </div>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={productForm.featured} onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })} />
                    Featured product
                  </label>
                  <button type="submit" className="btn btn-primary">
                    {editingId ? 'Update Product' : 'Add Product'}
                  </button>
                  {editingId && (
                    <button type="button" className="btn btn-ghost" onClick={() => { setEditingId(null); setProductForm({ name: '', description: '', price: '', category: '', image: '', stock: '', featured: false }); }}>
                      Cancel Edit
                    </button>
                  )}
                </form>

                <table className="admin-table">
                  <thead>
                    <tr><th>Name</th><th>Price</th><th>Stock</th><th>Category</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td>${p.price.toFixed(2)}</td>
                        <td>{p.stock}</td>
                        <td>{p.category}</td>
                        <td>
                          <button className="btn btn-ghost btn-sm" onClick={() => startEditProduct(p)}>Edit</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => deleteProduct(p.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Categories Tab */}
            {tab === 'categories' && (
              <div className="admin-section">
                <form onSubmit={handleCategorySubmit} className="admin-form">
                  <h2>Add Category</h2>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Name</label>
                      <input value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>Icon (emoji)</label>
                      <input value={categoryForm.icon} onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })} placeholder="📦" />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary">Add Category</button>
                </form>

                <div className="category-list">
                  {categories.map((c) => (
                    <div key={c.id} className="category-item">
                      <span>{c.icon} {c.name}</span>
                      <code>{c.id}</code>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {tab === 'orders' && (
              <div className="admin-section">
                <table className="admin-table">
                  <thead>
                    <tr><th>Tracking #</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td>{o.trackingNumber}</td>
                        <td>{o.userEmail}</td>
                        <td>${o.total.toFixed(2)}</td>
                        <td><span className={`status-badge status-${o.status}`}>{o.status}</span></td>
                        <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                        <td>
                          <select
                            value={o.status}
                            onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                            className="status-select"
                          >
                            {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Notifications Tab */}
            {tab === 'notifications' && (
              <div className="admin-section">
                <form onSubmit={handleBroadcast} className="admin-form">
                  <h2>Send Push Notification</h2>
                  <div className="form-group">
                    <label>Title</label>
                    <input value={notificationForm.title} onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })} required placeholder="Summer Sale!" />
                  </div>
                  <div className="form-group">
                    <label>Message</label>
                    <textarea value={notificationForm.body} onChange={(e) => setNotificationForm({ ...notificationForm, body: e.target.value })} required placeholder="Get 20% off all items this weekend!" rows={3} />
                  </div>
                  <div className="form-group">
                    <label>Link URL</label>
                    <input value={notificationForm.url} onChange={(e) => setNotificationForm({ ...notificationForm, url: e.target.value })} placeholder="/products" />
                  </div>
                  <button type="submit" className="btn btn-primary">Send to All Subscribers</button>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
