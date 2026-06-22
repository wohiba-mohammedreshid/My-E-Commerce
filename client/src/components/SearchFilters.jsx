/**
 * Search bar and filter controls for the product catalog.
 */
export default function SearchFilters({ filters, onChange, categories }) {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="search-filters">
      <input
        type="text"
        className="input search-input"
        placeholder="Search products..."
        value={filters.search}
        onChange={(e) => handleChange('search', e.target.value)}
      />

      <select
        className="input select-input"
        value={filters.category}
        onChange={(e) => handleChange('category', e.target.value)}
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.icon} {cat.name}
          </option>
        ))}
      </select>

      <select
        className="input select-input"
        value={filters.sort}
        onChange={(e) => handleChange('sort', e.target.value)}
      >
        <option value="">Sort by</option>
        <option value="name">Name A-Z</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="rating">Top Rated</option>
      </select>

      <div className="price-filters">
        <input
          type="number"
          className="input price-input"
          placeholder="Min $"
          value={filters.minPrice}
          onChange={(e) => handleChange('minPrice', e.target.value)}
        />
        <span>—</span>
        <input
          type="number"
          className="input price-input"
          placeholder="Max $"
          value={filters.maxPrice}
          onChange={(e) => handleChange('maxPrice', e.target.value)}
        />
      </div>
    </div>
  );
}
