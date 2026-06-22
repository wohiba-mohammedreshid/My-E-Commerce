/**
 * Product Card — displays a product in the catalog grid.
 */
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  function handleAddToCart(e) {
    e.preventDefault();
    addItem(product);
  }

  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-card-link">
        <div className="product-card-image">
          <img src={product.image} alt={product.name} loading="lazy" />
          {product.featured && <span className="badge badge-featured">Featured</span>}
          {product.stock === 0 && <span className="badge badge-soldout">Sold Out</span>}
        </div>

        <div className="product-card-body">
          <h3 className="product-card-title">{product.name}</h3>
          <div className="product-card-rating">
            {'★'.repeat(Math.round(product.rating))}
            {'☆'.repeat(5 - Math.round(product.rating))}
            <span>({product.reviewCount})</span>
          </div>
          <p className="product-card-price">${product.price.toFixed(2)}</p>
        </div>
      </Link>

      <button
        className="btn btn-primary btn-block"
        onClick={handleAddToCart}
        disabled={product.stock === 0}
      >
        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
      </button>
    </article>
  );
}
