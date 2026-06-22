/**
 * Product Detail Page — images, description, price, reviews, and add to cart.
 */
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productApi } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import StarRating from '../components/StarRating';

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await productApi.getById(id);
        setProduct(data);
      } catch (error) {
        console.error('Failed to load product:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  function handleAddToCart() {
    addItem(product, quantity);
  }

  async function handleSubmitReview(e) {
    e.preventDefault();
    if (!isAuthenticated) return;
    setSubmitting(true);
    try {
      await productApi.addReview(id, { rating: reviewRating, comment: reviewComment });
      const updated = await productApi.getById(id);
      setProduct(updated);
      setReviewComment('');
      setReviewRating(5);
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSpinner message="Loading product..." />;
  if (!product) {
    return (
      <div className="container empty-state">
        <h2>Product not found</h2>
        <Link to="/products" className="btn btn-primary">Back to Shop</Link>
      </div>
    );
  }

  const images = product.images || [product.image];

  return (
    <div className="product-detail">
      <div className="container">
        <nav className="breadcrumb">
          <Link to="/products">Products</Link> / <span>{product.name}</span>
        </nav>

        <div className="product-detail-layout">
          {/* Image Gallery */}
          <div className="product-gallery">
            <div className="product-main-image">
              <img src={images[selectedImage]} alt={product.name} />
            </div>
            {images.length > 1 && (
              <div className="product-thumbnails">
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`thumbnail ${i === selectedImage ? 'active' : ''}`}
                    onClick={() => setSelectedImage(i)}
                  >
                    <img src={img} alt={`${product.name} view ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info">
            <h1>{product.name}</h1>
            <div className="product-rating-large">
              <StarRating rating={Math.round(product.rating)} readonly />
              <span>{product.rating.toFixed(1)} ({product.reviewCount} reviews)</span>
            </div>
            <p className="product-price-large">${product.price.toFixed(2)}</p>
            <p className="product-description">{product.description}</p>

            <div className="product-meta">
              <span>Category: <strong>{product.category}</strong></span>
              <span>Stock: <strong>{product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</strong></span>
            </div>

            {product.stock > 0 && (
              <div className="add-to-cart-section">
                <div className="quantity-selector">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>+</button>
                </div>
                <button className="btn btn-primary btn-lg" onClick={handleAddToCart}>
                  Add to Cart — ${(product.price * quantity).toFixed(2)}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <section className="reviews-section">
          <h2>Customer Reviews ({product.reviews?.length || 0})</h2>

          {isAuthenticated && (
            <form className="review-form" onSubmit={handleSubmitReview}>
              <h3>Write a Review</h3>
              <StarRating rating={reviewRating} onChange={setReviewRating} />
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience..."
                rows={3}
              />
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}

          <div className="reviews-list">
            {product.reviews?.length === 0 && (
              <p className="text-muted">No reviews yet. Be the first!</p>
            )}
            {product.reviews?.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <strong>{review.userName}</strong>
                  <StarRating rating={review.rating} readonly />
                  <span className="review-date">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {review.comment && <p>{review.comment}</p>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
