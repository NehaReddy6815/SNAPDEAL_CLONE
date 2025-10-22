import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./Products.css";
import { Link, useLocation } from "react-router-dom";
import RatingDisplay from "./Rating";

function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedColors, setSelectedColors] = useState([]);
  const location = useLocation();

  // Read ?subcategory= from URL
  const queryParams = new URLSearchParams(location.search);
  const subcategory = queryParams.get("subcategory");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/products");
        const subFiltered = subcategory
          ? res.data.filter(
            (p) =>
              p.subcategory?.toLowerCase() === subcategory.toLowerCase()
          )
          : res.data;
        setProducts(subFiltered);
        setFilteredProducts(subFiltered);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    fetchProducts();
  }, [subcategory]);

  // Apply filters (memoized)
  const applyFilters = useCallback(
    (range, colors) => {
      let result = products;

      // Price filter
      result = result.filter(
        (p) => p.price >= range[0] && p.price <= range[1]
      );

      // Color filter
      if (colors.length > 0) {
        result = result.filter((p) =>
          colors.includes(p.color?.toLowerCase())
        );
      }

      setFilteredProducts(result);
    },
    [products]
  );

  // Apply filters whenever price or color changes
  useEffect(() => {
    applyFilters(priceRange, selectedColors);
  }, [priceRange, selectedColors, applyFilters]);

  // Handle color filtering
  const toggleColor = (color) => {
    const newColors = selectedColors.includes(color)
      ? selectedColors.filter((c) => c !== color)
      : [...selectedColors, color];

    setSelectedColors(newColors);
  };

  return (
    <div className="products-page">
      {/* Left Sidebar Filters */}
      <div className="filters">
        <h4>Filters</h4>

        {/* Price Filter */}
        <div className="filter-section">
          <h5>Price</h5>
          <div className="price-slider">
            {/* Selected range highlight */}
            <div
              className="range-track"
              style={{
                left: `${(priceRange[0] / 5000) * 100}%`,
                right: `${100 - (priceRange[1] / 5000) * 100}%`,
              }}
            ></div>

            {/* Min range */}
            <input
              type="range"
              min="0"
              max="5000"
              step="100"
              value={priceRange[0]}
              onChange={(e) =>
                setPriceRange([Math.min(parseInt(e.target.value), priceRange[1]), priceRange[1]])
              }
            />
            {/* Max range */}
            <input
              type="range"
              min="0"
              max="5000"
              step="100"
              value={priceRange[1]}
              onChange={(e) =>
                setPriceRange([priceRange[0], Math.max(parseInt(e.target.value), priceRange[0])])
              }
            />
          </div>
          <p>
            ₹{priceRange[0]} - ₹{priceRange[1]}
          </p>
        </div>


        {/* Color Filter */}
        <div className="filter-section">
          <h5>Color</h5>
          {["red", "blue", "black", "white", "green"].map((color) => (
            <label key={color} className="color-option">
              <input
                type="checkbox"
                checked={selectedColors.includes(color)}
                onChange={() => toggleColor(color)}
              />
              <span
                className="color-box"
                style={{ backgroundColor: color }}
              ></span>
              {color}
            </label>
          ))}
        </div>
      </div>

      {/* Right Product Grid */}
      <div className="products-container">
        {filteredProducts.map((prod) => (
          <div key={prod._id} className="product-card">
            <Link
                        to={`/product/${prod._id}`}
                        key={prod._id}
                        className="recently-viewed-card-link"
                      >
                        <div className="recently-viewed-card">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            loading="lazy"
                          />
                          <div className="recently-viewed-name">
                            {prod.name}
                          </div>
                            <div  className="recently-viewed-rating" ><RatingDisplay  value={prod.rating || 0} showValue={false}/></div>
            
                          <div className="recently-viewed-price">
                            
                            <span className="original">Rs {Math.round(prod.price * 1.3)}</span>
                            <span className="current">Rs {prod.price}</span>
                            <span className="recently-viewed-discount">
                              {Math.round(((prod.price * 1.3 - prod.price) / (prod.price * 1.3)) * 100)}% OFF
                            </span>
                          </div>
                        </div>
                      </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Products;
