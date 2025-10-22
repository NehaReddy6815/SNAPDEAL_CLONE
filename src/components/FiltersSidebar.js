import { useState, useEffect } from "react";
import "./FiltersSidebar.css";
import { useNavigate } from "react-router-dom";

function FiltersSidebar({
  brands = [],
  categories = [], // array of objects with name and sub array
  colors = [],
  initialMinPrice = 0,
  initialMaxPrice = 0,
  filters,
  onChange,
}) {
  const [localMin, setLocalMin] = useState(filters.minPrice ?? initialMinPrice);
  const [localMax, setLocalMax] = useState(filters.maxPrice ?? initialMaxPrice);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const navigate = useNavigate();
  const handleCategoryClick = (categoryName) => {
    // Navigate to category page with category filter
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  const handleSubCategoryClick = (categoryName, subCategoryName) => {
    // Navigate to category + subcategory page
    navigate(
      `/products?category=${encodeURIComponent(categoryName)}&subcategory=${encodeURIComponent(subCategoryName)}`
    );
  };

  useEffect(() => {
    setLocalMin(filters.minPrice ?? initialMinPrice);
    setLocalMax(filters.maxPrice ?? initialMaxPrice);
  }, [filters.minPrice, filters.maxPrice, initialMinPrice, initialMaxPrice]);

  const handlePriceApply = () => {
    if (isNaN(Number(localMin)) || isNaN(Number(localMax))) return;
    onChange({ ...filters, minPrice: Number(localMin), maxPrice: Number(localMax) });
  };

  const toggleSetValue = (set, value) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  };

  const toggleCategory = (categoryName) => {
    const next = new Set(expandedCategories);
    if (next.has(categoryName)) {
      next.delete(categoryName);
    } else {
      next.add(categoryName);
    }
    setExpandedCategories(next);
  };

  return (
    <aside className="filters-sidebar">
      <h3 className="filters-title">Filters</h3>

      {/* Categories */}
      {/* Categories */}
      <section className="filter-block">
        <h4>Categories</h4>
        <div className="options-list">
          {categories && categories.map((category) => (
            <div key={category.name} className="category-group">
              <div className="category-header">
                {/* Toggle icon → expand/collapse */}
                <span
                  className="expand-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCategory(category.name);
                  }}
                >
                  {expandedCategories.has(category.name) ? "−" : "+"}
                </span>

                {/* Category name → show products */}
                <span
                  className="category-name"
                  onClick={() => handleCategoryClick(category.name)}
                >
                  {category.name}
                </span>
              </div>


              {/* Subcategories */}
              {expandedCategories.has(category.name) && category.sub && (
                <div className="sub-categories">
                  {category.sub.map((subCat) => {
                    const subName = typeof subCat === "string" ? subCat : subCat.name;
                    return (
                      <div
                        key={subName}
                        className="subcategory-item"
                        onClick={() => handleSubCategoryClick(category.name, subName)}
                      >
                        <span>{subName}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>


      {/* Price */}
      <section className="filter-block">
        <h4>Price</h4>
        <div className="price-inputs">
          <input
            type="number"
            min={0}
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            placeholder="Min"
          />
          <span className="range-sep">-</span>
          <input
            type="number"
            min={0}
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            placeholder="Max"
          />
          <button className="apply-btn" onClick={handlePriceApply}>
            Go
          </button>
        </div>
        <input
          className="range"
          type="range"
          min={initialMinPrice}
          max={initialMaxPrice}
          value={Math.min(Number(localMax), Number(initialMaxPrice))}
          onChange={(e) => setLocalMax(Number(e.target.value))}
        />
        <div className="range-values">
          <span>Rs. {initialMinPrice}</span>
          <span>Rs. {initialMaxPrice}</span>
        </div>
      </section>

      {/* Brands */}
      <section className="filter-block">
        <h4>Brand</h4>
        <div className="options-list">
          {brands.map((b) => (
            <label key={b} className="option-item">
              <input
                type="checkbox"
                checked={filters.brands?.has(b) || false}
                onChange={() =>
                  onChange({
                    ...filters,
                    brands: toggleSetValue(filters.brands || new Set(), b),
                  })
                }
              />
              <span>{b}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Colors */}
      <section className="filter-block">
        <h4>Colors</h4>
        <div className="options-list colors-list">
          {colors.map((color) => (
            <label key={color} className="option-item">
              <input
                type="checkbox"
                checked={filters.colors?.has(color) || false}
                onChange={() =>
                  onChange({
                    ...filters,
                    colors: toggleSetValue(filters.colors || new Set(), color),
                  })
                }
              />
              <span
                className="color-swatch"
                style={{ backgroundColor: color.toLowerCase() }}
              ></span>
              <span className="color-name">{color}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Ratings */}
      <section className="filter-block">
        <h4>Ratings</h4>
        <div className="options-list">
          {[4, 3, 2, 1].map((r) => (
            <label key={r} className="option-item">
              <input
                type="radio"
                name="rating"
                checked={(filters.minRating || 0) === r}
                onChange={() => onChange({ ...filters, minRating: r })}
              />
              <span>&amp; Up</span>
              <span className="stars">{"★".repeat(r) + "☆".repeat(5 - r)}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Clear All */}
      <button
        className="clear-btn"
        onClick={() =>
          onChange({
            minPrice: initialMinPrice,
            maxPrice: initialMaxPrice,
            brands: new Set(),
            categories: new Set(),
            colors: new Set(),
            minRating: 0,
          })
        }
      >
        Clear All
      </button>
    </aside>
  );
}

export default FiltersSidebar;
