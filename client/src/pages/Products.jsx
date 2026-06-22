/**
 * Products Page — catalog with search, category filter, and price sorting.
 */
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productApi, categoryApi } from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Read filters from URL query params
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  useEffect(() => {
    categoryApi.getAll().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        if (category) params.category = category;
        if (sort) params.sort = sort;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        const data = await productApi.getAll(params);
        setProducts(data);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [search, category, sort, minPrice, maxPrice]);

  function updateFilter(key, value) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  }

  return (
    <div className="products-page">
      <div className="container">
        <h1 className="page-title">
          {search ? `Results for "${search}"` : category ? `${category} Products` : 'All Products'}
        </h1>

        <div className="products-layout">
          {/* Sidebar Filters */}
          <aside className="filters-sidebar">
            <h3>Filters</h3>

            <div className="filter-group">
              <label>Category</label>
              <select
                value={category}
                onChange={(e) => updateFilter('category', e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Sort By</label>
              <select
                value={sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
              >
                <option value="">Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Min Price ($)</label>
              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={(e) => updateFilter('minPrice', e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="filter-group">
              <label>Max Price ($)</label>
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
                placeholder="Any"
              />
            </div>

            {(category || sort || minPrice || maxPrice) && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setSearchParams(search ? { search } : {})}
              >
                Clear Filters
              </button>
            )}
          </aside>

          {/* Product Grid */}
          <div className="products-main">
            {loading ? (
              <LoadingSpinner message="Loading products..." />
            ) : products.length === 0 ? (
              <div className="empty-state">
                <p>No products found. Try adjusting your filters.</p>
              </div>
            ) : (
              <>
                <p className="results-count">{products.length} product{products.length !== 1 ? 's' : ''} found</p>
                <div className="product-grid">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
