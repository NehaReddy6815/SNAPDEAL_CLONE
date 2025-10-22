import { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./SearchResults.css";
import FiltersSidebar from "./FiltersSidebar";
import { categories as allCategoryData } from '../data/categories';
import RatingDisplay from './Rating';

function SearchResults() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({ 
    minPrice: 0, 
    maxPrice: 0,   
    colors: new Set(),  
    brands: new Set(), 
    categories: new Set(), 
    minRating: 0 
  });

  const [allBrands, setAllBrands] = useState([]);
  const [allColors, setAllColors] = useState([]);
  const [priceBounds, setPriceBounds] = useState({ min: 0, max: 0 });

  const [pincode, setPincode] = useState('');
  const [pincodeError, setPincodeError] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState('');
  const [sortBy, setSortBy] = useState('relevance');

  const location = useLocation();
  const navigate = useNavigate();

  const trendingSearches = [
    "T-shirts",
    "sarees",
    "Formal Shoes",
    "Home & Kitchen",
    "Soft Toys",
    "Beauty, Health"
  ];

  const urlParams = new URLSearchParams(location.search);
  const searchQuery = urlParams.get('q');
  const categoryQuery = urlParams.get('category');
  const subcategoryQuery = urlParams.get('subcategory');

  // Breadcrumbs
  const breadcrumbs = [{ label: "Home", to: "/" }];
  if (searchQuery) breadcrumbs.push({ label: `Search: ${decodeURIComponent(searchQuery)}`, to: `/search?q=${encodeURIComponent(searchQuery)}` });
  if (categoryQuery) breadcrumbs.push({ label: decodeURIComponent(categoryQuery), to: `/products?category=${encodeURIComponent(categoryQuery)}` });
  if (subcategoryQuery) breadcrumbs.push({ label: decodeURIComponent(subcategoryQuery), to: `/products?category=${encodeURIComponent(categoryQuery)}&subcategory=${encodeURIComponent(subcategoryQuery)}` });

  // Get filtered sidebar categories based on search/category
  const sidebarCategories = useMemo(() => {
    // Transform categories into the format expected by FiltersSidebar
    const transformCategory = (cat) => ({
      name: cat.name,
      sub: cat.sub.reduce((acc, subCat) => [...acc, ...subCat.items], [])
    });

    if (categoryQuery) {
      const filtered = allCategoryData.filter(cat => cat.name === categoryQuery);
      return filtered.map(transformCategory);
    }
    
    if (searchQuery) {
      const decodedSearch = decodeURIComponent(searchQuery).toLowerCase();
      const filtered = allCategoryData.filter(cat => 
        cat.name.toLowerCase() === decodedSearch ||
        cat.sub.some(sub => sub.items.some(item => item.toLowerCase() === decodedSearch))
      );
      return filtered.map(transformCategory);
    }

    const productCats = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
    const filtered = allCategoryData.filter(cat => productCats.includes(cat.name));
    return filtered.map(transformCategory);
  }, [categoryQuery, searchQuery, products]);

  // Compute filtered products
  // Get filtered sidebar categories based on search/category
// const sidebarCategories = useMemo(() => {
//   const transformCategory = (cat, filterItem = null) => ({
//     name: cat.name,
//     sub: cat.sub
//       .map(subCat => {
//         // keep only matching items when searching
//         const matchedItems = filterItem
//           ? subCat.items.filter(item =>
//               item.toLowerCase().includes(filterItem.toLowerCase())
//             )
//           : subCat.items;

//         return matchedItems.length > 0 ? { ...subCat, items: matchedItems } : null;
//       })
//       .filter(Boolean) // drop empty subcategories
//       .flatMap(subCat => subCat.items) // flatten to match FiltersSidebar expectation
//   });

//   if (categoryQuery) {
//     const filtered = allCategoryData.filter(cat => cat.name === categoryQuery);
//     return filtered.map(cat => transformCategory(cat));
//   }

//   if (searchQuery) {
//     const decodedSearch = decodeURIComponent(searchQuery).toLowerCase();
//     const filtered = allCategoryData.filter(cat =>
//       cat.name.toLowerCase() === decodedSearch ||
//       cat.sub.some(sub => sub.items.some(item => item.toLowerCase().includes(decodedSearch)))
//     );
//     return filtered.map(cat => transformCategory(cat, decodedSearch));
//   }

//   const productCats = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
//   const filtered = allCategoryData.filter(cat => productCats.includes(cat.name));
//   return filtered.map(cat => transformCategory(cat));
// }, [categoryQuery, searchQuery, products]);

  const getAverageRating = (reviews) => reviews?.length ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length : 0;

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(p => {
      const priceOk = (Number(p.price) || 0) >= (filters.minPrice || 0) && (Number(p.price) || 0) <= (filters.maxPrice || Infinity);
      const brandOk = !filters.brands.size || filters.brands.has(p.brand);
      const categoryOk = !filters.categories.size || filters.categories.has(p.category) || (p.subcategory && filters.categories.has(p.subcategory));
      const colorOk = !filters.colors.size || filters.colors.has(p.color);
      const ratingOk = !filters.minRating || getAverageRating(p.reviews) >= filters.minRating;
      return priceOk && brandOk && categoryOk && colorOk && ratingOk;
    });

    // Sorting
    switch(sortBy) {
      case 'price-low-high': return filtered.sort((a,b)=> (Number(a.price)||0) - (Number(b.price)||0));
      case 'price-high-low': return filtered.sort((a,b)=> (Number(b.price)||0) - (Number(a.price)||0));
      case 'popularity': return filtered.sort((a,b)=> (Number(b.ratingsCount)||0) - (Number(a.ratingsCount)||0));
      case 'discount': return filtered.sort((a,b)=> {
        const discountA = a.originalPrice ? ((a.originalPrice - a.price)/a.originalPrice)*100 : 0;
        const discountB = b.originalPrice ? ((b.originalPrice - b.price)/b.originalPrice)*100 : 0;
        return discountB - discountA;
      });
      case 'fresh-arrivals': return filtered.sort((a,b)=> new Date(b.createdAt||0) - new Date(a.createdAt||0));
      default: return filtered;
    }
  }, [products, filters, sortBy]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      if (!searchQuery && !categoryQuery && !subcategoryQuery) return;
      setLoading(true); setError(null);
      try {
        let url = 'http://localhost:5000/products?';
        if (subcategoryQuery) url += `category=${encodeURIComponent(categoryQuery)}&subcategory=${encodeURIComponent(subcategoryQuery)}`;
        else if (categoryQuery) url += `category=${encodeURIComponent(categoryQuery)}`;
        else if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}`;

        const response = await axios.get(url);
        const items = response.data || [];
        setProducts(items);

        if (items.length) {
          const prices = items.map(p=>Number(p.price)||0);
          setPriceBounds({ min: Math.min(...prices), max: Math.max(...prices) });
          setFilters(f=>({ ...f, minPrice: Math.min(...prices), maxPrice: Math.max(...prices) }));
          setAllBrands(Array.from(new Set(items.map(p=>p.brand).filter(Boolean))));
          setAllColors(Array.from(new Set(items.map(p=>p.color).filter(Boolean))));
        } else {
          setPriceBounds({ min: 0, max: 0 });
          setFilters({ minPrice: 0, maxPrice: 0, brands: new Set(), categories: new Set(), colors: new Set(), minRating: 0 });
          setAllBrands([]); setAllColors([]);
        }
      } catch(err) {
        console.error('Error fetching products:', err);
        setError('Failed to fetch search results. Please try again.');
      } finally { setLoading(false); }
    };
    fetchProducts();
  }, [searchQuery, categoryQuery, subcategoryQuery]);

  // Pincode validation
  const validatePincode = (p) => /^[1-9][0-9]{5}$/.test(p);
  const checkDeliveryAvailability = (p) => !['000000','111111','999999','123456','654321'].includes(p);
  const handlePincodeCheck = () => {
    if(!pincode){ setPincodeError('Please enter a pincode'); setPincodeStatus(''); return; }
    if(!validatePincode(pincode)){ setPincodeError('Please enter a valid 6-digit pincode'); setPincodeStatus(''); return; }
    setPincodeError('');
    setPincodeStatus(checkDeliveryAvailability(pincode) ? `Delivers to ${pincode}` : 'Not available - Change pincode');
  };

  if (!searchQuery && !categoryQuery && !subcategoryQuery) return <div className="search-results-container">Please enter a search term or category</div>;
  if (loading) return <div className="search-results-container"><div className="loading">Searching products...</div></div>;
  if (error) return <div className="search-results-container"><div className="error">{error}</div></div>;

  return (
    <div className="search-results-container">
      {products.length === 0 ? (
        <div className="no-results">
          <h3>No products found</h3>
          <p>Try different keywords or check your spelling</p>
        </div>
      ) : (
        <div>
          <div className="breadcrumbs-container">
            {breadcrumbs.map((crumb, index) => (
              <span key={index}>
                {crumb.to ? <a href={crumb.to}>{crumb.label}</a> : <span>{crumb.label}</span>}
                {index < breadcrumbs.length - 1 && " > "}
              </span>
            ))}
          </div>

          <div className="trending-searches">
            <span>Trending searches: </span>
            {trendingSearches.map((term, idx) => (
              <button key={idx} className="trending-btn" onClick={() => navigate(`/search?q=${encodeURIComponent(term)}`)}>{term}</button>
            ))}
          </div>

          <div className="main-layout">
            <div className="left-colmn">
              <FiltersSidebar
                brands={allBrands}
                colors={allColors}
                categories={sidebarCategories}
                initialMinPrice={priceBounds.min}
                initialMaxPrice={priceBounds.max}
                filters={filters}
                onChange={setFilters}
              />
            </div>

            <div className="right-colmn">
              <div className="top-controls">
                <div className="pincode-section">
                  <input type="text" placeholder="Enter pincode" value={pincode} onChange={e=>{setPincode(e.target.value); setPincodeStatus(''); setPincodeError('')}} />
                  <button onClick={handlePincodeCheck} className="check-button">Check</button>
                  {pincodeError && <span className="pincode-error">{pincodeError}</span>}
                  {pincodeStatus && <span className={`pincode-status ${pincodeStatus.includes('Not available') ? 'unavailable' : 'available'}`}>{pincodeStatus}</span>}
                </div>

                <div className="sort-section">
                  <label htmlFor="sort-select">Sort By:</label>
                  <select id="sort-select" value={sortBy} onChange={e=>setSortBy(e.target.value)}>
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
                {filteredProducts.map(p => (
                  <div key={p._id} className="product-card" onClick={()=>navigate(`/product/${p._id}`)}>
                    <img src={p.image} alt={p.name} className="product-image" />
                    <div className="product-details">
                      <h3>{p.name}</h3>
                      <div className="product-pricing">
                        {p.originalPrice && <span className="product-original-price">₹{p.originalPrice}</span>}
                        <span className="product-price">₹{p.price}</span>
                        {p.originalPrice && <span className="discount">{Math.round((1 - p.price/p.originalPrice)*100)}% OFF</span>}
                      </div>
                      <RatingDisplay value={getAverageRating(p.reviews)} showValue={false} readOnly />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchResults;
