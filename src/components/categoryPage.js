import { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import FiltersSidebar from './FiltersSidebar';
import "./SearchResults.css"; // reuse same styles
import RatingDisplay from './Rating';

function CategoryPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ 
        minPrice: 0, 
        maxPrice: 0, 
        brands: new Set(), 
        categories: new Set(),
        colors: new Set(), 
        minRating: 0 
    });
    const [allBrands, setAllBrands] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [allColors, setAllColors] = useState([]); 
    const [priceBounds, setPriceBounds] = useState({ min: 0, max: 0 });
    const [pincode, setPincode] = useState('');
    const [pincodeError, setPincodeError] = useState('');
    const [pincodeStatus, setPincodeStatus] = useState('');
    const [sortBy, setSortBy] = useState('relevance');
    const trendingSearches = [
        "T-shirts",
        "sarees",
        "Formal Shoes",
        "Home & Kitchen",
        "Soft Toys",
        "Beauty, Health"
    ];
    const location = useLocation();
    const navigate = useNavigate();

    const getAverageRating = (reviews) => {
        if (!reviews || reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
        return sum / reviews.length;
    };

    const filteredProducts = useMemo(() => {
        let filtered = products.filter((p) => {
            const priceOk = (Number(p.price) || 0) >= (filters.minPrice || 0) && (Number(p.price) || 0) <= (filters.maxPrice || Infinity);
            const brandOk = (filters.brands?.size || 0) === 0 || filters.brands.has(p.brand);
            const categoryOk = (filters.categories?.size || 0) === 0 || filters.categories.has(p.category);
            const rating = getAverageRating(p.reviews);
            const ratingOk = filters.minRating === 0 || rating >= filters.minRating;
            const colorOk = (filters.colors?.size || 0) === 0 || filters.colors.has(p.color);
            return priceOk && brandOk && categoryOk && colorOk && ratingOk;
        });

        switch (sortBy) {
            case 'price-low-high':
                return filtered.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
            case 'price-high-low':
                return filtered.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
            case 'popularity':
                return filtered.sort((a, b) => (Number(b.ratingsCount) || 0) - (Number(a.ratingsCount) || 0));
            case 'discount':
                return filtered.sort((a, b) => {
                    const discountA = a.originalPrice ? ((a.originalPrice - a.price) / a.originalPrice) * 100 : 0;
                    const discountB = b.originalPrice ? ((b.originalPrice - b.price) / b.originalPrice) * 100 : 0;
                    return discountB - discountA;
                });
            case 'fresh-arrivals':
                return filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            default:
                return filtered;
        }
    }, [products, filters, sortBy]);

    const urlParams = new URLSearchParams(location.search);
    const categoryQuery = urlParams.get('category');
    const subcategoryQuery = urlParams.get('subcategory');
    const breadcrumbs = [{ label: "Home", to: "/" }];

    if (categoryQuery) {
        const displayCategory = decodeURIComponent(categoryQuery);
        const urlCategory = encodeURIComponent(categoryQuery);
        breadcrumbs.push({
            label: displayCategory,
            to: `/products?category=${urlCategory}`
        });
    }

    if (!categoryQuery && filteredProducts.length > 0) {
        const firstProduct = filteredProducts[0];
        if (firstProduct.category) {
            breadcrumbs.push({
                label: firstProduct.category,
                to: `/products?category=${encodeURIComponent(firstProduct.category)}`
            });
        }
        if (firstProduct.subcategory) {
            breadcrumbs.push({
                label: firstProduct.subcategory,
                to: `/products?category=${encodeURIComponent(firstProduct.category)}&subcategory=${encodeURIComponent(firstProduct.subcategory)}`
            });
        }
    }

    useEffect(() => {
        const fetchProducts = async () => {
            if (!subcategoryQuery && !categoryQuery) return; // fetch only if something is selected
            setLoading(true);
            setError(null);
      
            try {
                let url = "http://localhost:5000/products?";
                if (subcategoryQuery) {
                    url += `subcategory=${encodeURIComponent(subcategoryQuery)}`;
                } else if (categoryQuery) {
                    url += `category=${encodeURIComponent(categoryQuery)}`;
                }
      
                console.log("Fetching from:", url);
                const response = await axios.get(url);
                const items = response.data || [];
                setProducts(items);

                if (items.length) {
                    const prices = items.map(p => Number(p.price) || 0);
                    const min = Math.min(...prices);
                    const max = Math.max(...prices);
                    setPriceBounds({ min, max });
                    setFilters(f => ({ ...f, minPrice: min, maxPrice: max }));
                    setAllBrands(Array.from(new Set(items.map(p => p.brand).filter(Boolean))));

                    // Fix categories format with subcategories
                    const categoriesMap = {};
                    items.forEach(item => {
                        if (!item.category) return;
                        if (!categoriesMap[item.category]) categoriesMap[item.category] = new Set();
                        if (item.subcategory) categoriesMap[item.category].add(item.subcategory);
                    });
                    const formattedCategories = Object.entries(categoriesMap).map(([name, subs]) => ({
                        name,
                        sub: Array.from(subs)
                    }));
                    setAllCategories(formattedCategories);

                    setAllColors(Array.from(new Set(items.map(p => p.color).filter(Boolean))));
                } else {
                    setPriceBounds({ min: 0, max: 0 });
                    setAllBrands([]);
                    setAllCategories([]);
                    setAllColors([]);
                    setFilters({ minPrice: 0, maxPrice: 0, brands: new Set(), categories: new Set(), colors: new Set(), minRating: 0 });
                }
            } catch (err) {
                console.error("Error fetching products:", err);
                setError("Failed to fetch products. Please try again.");
            } finally {
                setLoading(false);
            }
        };
      
        fetchProducts();
    }, [categoryQuery, subcategoryQuery]);

    const validatePincode = (pincode) => /^[1-9][0-9]{5}$/.test(pincode);

    const handlePincodeCheck = () => {
        if (!pincode) return setPincodeError('Please enter a pincode');
        if (!validatePincode(pincode)) return setPincodeError('Please enter a valid 6-digit pincode');
        setPincodeError('');
        setPincodeStatus(!['000000','111111','999999','123456','654321'].includes(pincode) ? `Delivers to ${pincode}` : 'Not available - Change pincode');
    };

    if (loading) return <div className="search-results-container">Loading products...</div>;
    if (error) return <div className="search-results-container">{error}</div>;

    return (
        <div className="search-results-container">
            <div className="breadcrumbs-container">
                {breadcrumbs.map((crumb, index) => (
                    <span key={index}>
                        {crumb.to ? (
                            <a href={crumb.to}>{crumb.label}</a>
                        ) : (
                            <span>{crumb.label}</span>
                        )}
                        {index < breadcrumbs.length - 1 && " > "}
                    </span>
                ))}
            </div>

            <div className="trending-searches">
                <span>Trending searches: </span>
                {trendingSearches.map((term, index) => (
                    <button
                        key={index}
                        className="trending-btn"
                        onClick={() => navigate(`/search?q=${encodeURIComponent(term)}`)}
                    >
                        {term}
                    </button>
                ))}
            </div>

            <div className="main-layout">
                <div className="left-colmn">
                    <FiltersSidebar
                        brands={allBrands}
                        categories={allCategories}
                        colors={allColors}  
                        initialMinPrice={priceBounds.min}
                        initialMaxPrice={priceBounds.max}
                        filters={filters}
                        onChange={setFilters}
                    />
                </div>
                <div className="right-colmn">
                    <div className="top-controls">
                        <div className="pincode-section">
                            <input
                                type="text"
                                placeholder="Enter pincode"
                                value={pincode}
                                onChange={(e) => { setPincode(e.target.value); setPincodeError(''); setPincodeStatus(''); }}
                            />
                            <button onClick={handlePincodeCheck}>Check</button>
                            {pincodeError && <span className="pincode-error">{pincodeError}</span>}
                            {pincodeStatus && <span className={`pincode-status ${pincodeStatus.includes('Not available') ? 'unavailable' : 'available'}`}>{pincodeStatus}</span>}
                        </div>
                        <div className="sort-section">
                            <label>Sort By:</label>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                <option value="relevance">Relevance</option>
                                <option value="popularity">Popularity</option>
                                <option value="price-low-high">Price Low To High</option>
                                <option value="price-high-low">Price High To Low</option>
                                <option value="discount">Discount</option>
                                <option value="fresh-arrivals">Fresh Arrivals</option>
                            </select>
                        </div>
                    </div>

                    <div className="search-results-gridd">
                        {filteredProducts.map(product => (
                            <div 
                                key={product._id} 
                                className="product-card"
                                onClick={() => navigate(`/product/${product._id}`)}
                                role="button"
                                tabIndex="0"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        navigate(`/product/${product._id}`);
                                    }
                                }}
                            >
                                <img 
                                    src={product.image} 
                                    alt={product.name}
                                    className="product-image"
                                />
                                <div className="product-details">
                                    <h3>{product.name}</h3>
                                    <div className="product-pricing">
                                        {product.originalPrice && (
                                            <span className="product-original-price">₹{product.originalPrice}</span>
                                        )}
                                        <span className="product-price">₹{product.price}</span>
                                        {product.originalPrice && (
                                            <span className="discount">
                                                {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                                            </span>
                                        )}
                                    </div>

                                    <RatingDisplay  
                                        value={getAverageRating(product.reviews)} 
                                        showValue={false} 
                                        readOnly={true} 
                                        className="search-rating"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CategoryPage;
