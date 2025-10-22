import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/cartSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Footer from "./footer";
import "./ProductDetail.css";
import RatingDisplay from "./Rating";

const getProductSizes = (product) => {
  // If product has specific sizes defined, use those
  if (product.sizes && product.sizes.length > 0) {
    return product.sizes;
  }

  // Default sizes based on category
  const categoryDefaults = {
    "Men's Fashion": [
      { name: 'S', inStock: true },
      { name: 'M', inStock: true },
      { name: 'L', inStock: true },
      { name: 'XL', inStock: true },
      { name: 'XXL', inStock: true }
    ],
    "Women's Fashion": [
      { name: 'XS', inStock: true },
      { name: 'S', inStock: true },
      { name: 'M', inStock: true },
      { name: 'L', inStock: true },
      { name: 'XL', inStock: true }
    ],
    "Toys, Kids' Fashion": [
      { name: '2-3Y', inStock: true },
      { name: '4-5Y', inStock: true },
      { name: '6-7Y', inStock: true },
      { name: '8-9Y', inStock: true },
      { name: '10-11Y', inStock: true }
    ],
    "Electronics": [{ name: 'Standard', inStock: true }],
    "Home & Kitchen": [{ name: 'Default', inStock: true }],
    "Beauty, Health": [{ name: 'Universal', inStock: true }]
  };

  // Return default sizes for the category or a universal default
  return categoryDefaults[product.category] || [{ name: 'One Size', inStock: true }];
};

function ProductDetail() {
  const highlightsRef = useRef(null);
  const reviewsRef = useRef(null);
  const questionRef = useRef(null);
  const [openSection, setOpenSection] = useState("highlights");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  

  const user = useSelector((state) => state.user.currentUser) || JSON.parse(localStorage.getItem("currentUser") || "null");
  const [reviewStats, setReviewStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [userReview, setUserReview] = useState({
    rating: 0,
    review: "",
    title: "",
  });

  const handleScrollToQuestion = () => {
    questionRef.current &&
      questionRef.current.scrollIntoView({ behavior: "smooth" });
  };
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [pincode, setPincode] = useState("");
  const [pinMsg, setPinMsg] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const saved = localStorage.getItem("selectedPincode");
    if (saved) setPincode(saved);
  }, []);

  const validatePin = (val) => /^\d{6}$/.test(val);

  const handleCheckPin = async () => {
    setPinMsg("");
    if (!validatePin(pincode)) {
      setPinMsg("Please enter a valid 6-digit pincode");
      return;
    }
    try {
      const res = await axios.post("http://localhost:5000/api/pincode/check", { pincode, productId: id });
      if (res.data?.available) {
        setPinMsg("Delivery available");
        localStorage.setItem("selectedPincode", pincode);
      } else {
        setPinMsg("Not available");
      }
    } catch (e) {
      setPinMsg("Unable to check pincode");
    }
  };

  useEffect(() => {
    if (product && product._id) {
      let ids = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
      ids = ids.filter((id) => id !== product._id);
      ids.unshift(product._id);
      if (ids.length > 10) ids = ids.slice(0, 10);
      localStorage.setItem("recentlyViewed", JSON.stringify(ids));
        const fetchReviews = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/reviews/${product._id}/reviews`
      );
      setReviews(response.data.reviews);
      setReviewStats(response.data.statistics);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };
      fetchReviews();
    }
  }, [product]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/reviews/${product._id}/reviews`
      );
      setReviews(response.data.reviews);
      setReviewStats(response.data.statistics);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const token = JSON.parse(localStorage.getItem("currentUser"))?.token;

    if (!token) {
      alert("Please login to submit a review");
      return;
    }

    try {
      await axios.post(
        `http://localhost:5000/api/reviews/${product._id}/reviews`,
        userReview,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      fetchReviews();
      setUserReview({ rating: 0, review: "", title: "" });
    } catch (error) {
      console.error("Error submitting review:", error);
      alert(error.response?.data?.message || "Error submitting review");
    }
  };

  if (!product) return <p>Loading...</p>;

  const breadcrumbs = [
    { label: "Home", to: "/" },
    {
      label: product.category,
      to: ["Men's Fashion", "Women's Fashion", "Home & Kitchen", "Toys, Kids' Fashion", "Beauty, Health"].includes(
        product.category
      )
        ? "/"
        : `/products?category=${encodeURIComponent(product.category)}`,
    },
    {
      label: product.subcategory,
      to: `/products?subcategory=${encodeURIComponent(product.subcategory)}`,
    },
    { label: product.name },
  ];

  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  const handleAddToCart = () => {
    // Check if size is required but not selected
    const sizes = getProductSizes(product);
    if (sizes.length > 1 && !selectedSize) {
      alert("Please select a size before adding to cart");
      return;
    }

    dispatch(addToCart({
      ...product,
      selectedSize: selectedSize || sizes[0].name // Use first available size as default for one-size products
    }));
    navigate("/cart");
  };

  
  // const sizes = getProductSizes(product);
  // if (sizes.length > 1 && !selectedSize) {
  //   alert("Please select a size before buying");
  //   return;
  // }
  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };
  const handlePayment = async () => {
    const currentUser = user || JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser || !currentUser.token) {
      alert("Please login to proceed with payment");
      navigate("/login");
      return;
    }
  
    if (!selectedSize) {
      alert("Please select a size before buying");
      return;
    }
  
    setLoading(true);
  
    const totalPrice = product.price;
    const deliveryCharge = totalPrice > 500 ? 0 : 40;
  
    try {
      const razorpayLoaded = await initializeRazorpay();
      if (!razorpayLoaded) {
        alert("Razorpay SDK failed to load");
        setLoading(false);
        return;
      }
  
      const orderData = {
        amount: (totalPrice + deliveryCharge),
        items: [{
          productId: product._id,
          name: product.name,
          quantity: 1,
          price: product.price,
          selectedSize: product.selectedSize || "", // add size
          color: product.color || ""
        }],
        shippingAddress: {
          fullName: currentUser.name || "User",
          mobile: currentUser.mobile || "9999999999",
          pincode: pincode || "000000",
          city: "Default City",
          state: "Default State",
          country: "India"
        }
      };
  
      const { data } = await axios.post(
        "http://localhost:5000/api/payment/create-order",
        orderData,
        { headers: { Authorization: `Bearer ${currentUser.token}` } }
      );
  
      const options = {
        key: data.key, // or data.key from backend
        amount: data.order.amount,
        currency: "INR",
        name: "Snapdeal Clone",
        description: "Purchase Payment",
        order_id: data.order.id,
        handler: async function (response) {
          try {
            const verifyData = await axios.post(
              "http://localhost:5000/api/payment/verify-payment",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              },
              { headers: { Authorization: `Bearer ${currentUser.token}` } }
            );
  
            if (verifyData.data.success) {
              alert("Payment successful! Your order has been placed.");
              navigate("/my-orders");
            } else {
              alert("Payment verification failed.");
            }
          } catch (err) {
            console.error(err);
            alert("Payment verification failed");
          }
        },
        prefill: {
          name: currentUser.name || "User",
          email: currentUser.email || "user@example.com",
          contact: currentUser.mobile || "9999999999"
        },
        theme: { color: "#e40046" }
      };
  
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
  
    } catch (err) {
      console.error("Payment error:", err);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };
  
  
  return (
    <>
      <div className="product-breadcrumbs">
        {breadcrumbs.map((crumb, idx) =>
          crumb.to ? (
            <span key={crumb.label}>
              <Link to={crumb.to}>{crumb.label}</Link>
              {idx < breadcrumbs.length - 1 && <span> / </span>}
            </span>
          ) : (
            <span key={crumb.label}>{crumb.label}</span>
          )
        )}
      </div>

      <div className="snapdeal-detail">
        <div className="snapdeal-main-row">
          <div className="snapdeal-gallery-col">
            <div className="snapdeal-img-row">
              <div className="snapdeal-small-img-wrap">
                <img className="snapdeal-small-img" src={images[0]} alt={product.name + " small"} />
              </div>
              <div className="snapdeal-main-img-wrap">
                <img className="snapdeal-main-img" src={images[selectedImg]} alt={product.name} />
                {product.stock === 0 && (
                          <div className="out-of-stock-badge">Out of Stock</div>
                                  )}
              </div>
            </div>
          </div>

          <div className="snapdeal-info">
            <h1 className="snapdeal-title">{product.name}</h1>

            <div className="snapdeal-rating-row">
               <RatingDisplay value={reviewStats.averageRating} showValue={false} readOnly={true} />
              <span className="snapdeal-separator">|</span>
              <span className="snapdeal-blue">{reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? 'Rating' : 'Ratings'}</span>
              <span className="snapdeal-separator">|</span>
              <span className="snapdeal-blue">{reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? 'Review' : 'Reviews'} </span>
              <span className="snapdeal-separator">|</span>
              <span className="snapdeal-blue">{product.numSelfies || 0} Selfies</span>
              <span className="snapdeal-separator">|</span>
              <span className="snapdeal-link" style={{ cursor: "pointer" }} onClick={handleScrollToQuestion}>
                Have a question?
              </span>
            </div>

            <hr className="rating-divider" />

            <div className="snapdeal-price-row">
              <span className="snapdeal-mrp">
                MRP <span className="snapdeal-mrp-strike">₹{product.originalPrice || (product.price + 200)}</span>
              </span>
              <span className="snapdeal-tax">(Inclusive of all taxes)</span>
            </div>
            <div className="snapdeal-offer-row">
              <span className="snapdeal-price">Rs. {product.price}</span>
              <span className="snapdeal-discount">
                {product.originalPrice ? Math.round(100 - (product.price / product.originalPrice) * 100) : 38}% OFF
              </span>
            </div>

            <div className="snapdeal-color-row">
              {/* Existing color section */}
            </div>

            <div className="snapdeal-size-row">
  {product.stock > 0 ? (
    <>
      <h3 className="size-title">Select Size</h3>
      <div className="size-options">
        {getProductSizes(product).map((size, index) => (
          <button
            key={index}
            className={`size-button ${selectedSize === size.name ? 'selected' : ''} ${!size.inStock ? 'out-of-stock' : ''}`}
            onClick={() => setSelectedSize(size.name)}
            disabled={!size.inStock}
          >
            {size.name}
          </button>
        ))}
      </div>
      {selectedSize && <p className="selected-size">Selected Size: {selectedSize}</p>}
    </>
  ) : (
    <p className="out-of-stock-text">Out of Stock</p>
  )}
</div>




            <div className="snapdeal-color-row">
              <span className="snapdeal-color-label">Color</span>
              <div className="snapdeal-color-list">
                <div className="snapdeal-color-item selected">
                  <img src={images[0]} alt={product.name} />
                </div>
              </div>
            </div>

            <div className="snapdeal-actions">
              <button className="snapdeal-cart-btn" onClick={handleAddToCart}>ADD TO CART</button>
              <button className="snapdeal-buy-btn" onClick={handlePayment}  disabled={loading}> BUY NOW</button>
            </div>

            <div className="snapdeal-delivery-row">
              <span className="snapdeal-delivery-label">Delivery</span>
              <div className="snapdeal-pincode-wrapper">
                <input type="text" placeholder="Enter pincode" className="snapdeal-pincode-input" value={pincode} onChange={(e)=> setPincode(e.target.value.replace(/[^0-9]/g, "").slice(0,6))} />
                <button className="snapdeal-check-btn" onClick={handleCheckPin}>Check</button>
              </div>
              {pinMsg && (
                <div style={{ marginTop: 6, color: pinMsg === "Delivery available" ? "#388e3c" : "#d32f2f" }}>
                  {pinMsg}
                </div>
              )}
              <span className="snapdeal-delivery-time">
                Generally delivered in 6 - 10 days
              </span>
            </div>
            <div>
              <span className="extrainfo">
                7 Days Easy Returns : We assure easy return of purchased items within 7 days of delivery
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed menu for below sections */}
      <div className="snapdeal-below-wrap">
      <div className="snapdeal-below-tabs">
        <div className="snapdeal-below-tab-menu">
          <button onClick={() => highlightsRef.current.scrollIntoView({ behavior: 'smooth' })}>Item Details</button>
          <button onClick={() => reviewsRef.current.scrollIntoView({ behavior: 'smooth' })}>Ratings & Reviews</button>
          <button onClick={() => questionRef.current.scrollIntoView({ behavior: 'smooth' })}>Have a Question?</button>
        </div>
        <div className="snapdeal-below-two-col">
          <div className="snapdeal-below-tab-content">
          {/* Accordion Section */}
          <div className="snapdeal-accordion">
            {/* Highlights */}
            <div className="snapdeal-accordion-item" ref={highlightsRef}>
              <div
                className="snapdeal-accordion-header"
                onClick={() =>
                  setOpenSection(openSection === "highlights" ? null : "highlights")
                }
              >
                <span className="snapdeal-accordion-icon">
                  {openSection === "highlights" ? "−" : "+"}
                </span>
                <span className="snapdeal-accordion-title">Highlights</span>
              </div>
              {openSection === "highlights" && (
                <div className="snapdeal-accordion-content">
                  <ul>
                    <li>100% Original Products</li>
                    <li>Pay on delivery might be available</li>
                    <li>Easy 7 days returns and exchanges</li>
                    <li>Try & Buy available for select products</li>
                    <li>Free Shipping on orders above ₹500</li>
                    <li>Secure Payments</li>
                    <li>1 Year Manufacturer Warranty</li>
                    <li>Top Rated Seller</li>
                    <li>Cash on Delivery available</li>
                    <li>GST invoice available</li>
                    {product.features &&
                      product.features.length > 0 &&
                      product.features.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
              )}
            </div>

            {/* Ratings & Reviews */}
            <div className="snapdeal-accordion-item" ref={reviewsRef}>
              <div
                className="snapdeal-accordion-header"
                onClick={() =>
                  setOpenSection(openSection === "reviews" ? null : "reviews")
                }
              >
                <span className="snapdeal-accordion-icon">
                  {openSection === "reviews" ? "−" : "+"}
                </span>
                <span className="snapdeal-accordion-title">Ratings & Reviews</span>
              </div>
              {openSection === "reviews" && (
                <div className="snapdeal-accordion-content">
                  <div className="rating-summary">
                    <div className="rating-average">
                      <div className="average-score">{reviewStats.averageRating.toFixed(1)}</div>
                      <RatingDisplay value={reviewStats.averageRating} showValue={false} readOnly={true} />
                      <div className="total-ratings">
                        {reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? 'Review' : 'Reviews'}
                      </div>
                    </div>

                    <div className="rating-bars">
                      {[5, 4, 3, 2, 1].map(stars => (
                        <div key={stars} className="rating-bar">
                          <span className="bar-label">{stars} Star</span>
                          <div className="bar-fill">
                            <div
                              className="bar-value"
                              style={{
                                width: `${(reviewStats.ratingCounts[stars] / reviewStats.totalReviews * 100) || 0}%`
                              }}
                            />
                          </div>
                          <span className="bar-count">{reviewStats.ratingCounts[stars]}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Review Form */}
                  <div className="rating-form">
                    <h3>Write a Review</h3>
                    <form onSubmit={handleReviewSubmit}>
                      <RatingDisplay
                        value={userReview.rating}
                        readOnly={false}
                        onRate={(rating) => setUserReview(prev => ({ ...prev, rating }))}
                      />
                      <input
                        type="text"
                        placeholder="Review Title (optional)"
                        value={userReview.title}
                        onChange={(e) => setUserReview(prev => ({ ...prev, title: e.target.value }))}
                      />
                      <textarea
                        placeholder="Write your review here..."
                        value={userReview.review}
                        onChange={(e) => setUserReview(prev => ({ ...prev, review: e.target.value }))}
                        required
                      />
                      <button type="submit">Submit Review</button>
                    </form>
                  </div>

                  {/* Reviews List */}
                  <div className="reviews-list">
                    {reviews.length > 0 ? reviews.map((review, index) => (
                      <div key={index} className="review-item">
                        <div className="review-header">
                          <RatingDisplay value={review.rating} readOnly={true} />
                          <span className="review-user">{review.userName}</span>
                          <span className="review-date">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.title && <h4>{review.title}</h4>}
                        <p className="review-text">{review.review}</p>
                        {review.verifiedPurchase && <span className="verified-purchase">Verified Purchase</span>}
                      </div>
                    )) : <p className="no-reviews">Be the first to review this product!</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Have a Question / Terms */}
            <div className="snapdeal-accordion-item" ref={questionRef}>
              <div
                className="snapdeal-accordion-header"
                onClick={() =>
                  setOpenSection(openSection === "question" ? null : "question")
                }
              >
                <span className="snapdeal-accordion-icon">
                  {openSection === "question" ? "−" : "+"}
                </span>
                <span className="snapdeal-accordion-title">Terms & Conditions</span>
              </div>
              {openSection === "question" && (
                <div className="snapdeal-accordion-content">
                  <p>
                    The images represent actual product though color of the image and
                    product may slightly differ. Snapdeal does not select, edit, modify,
                    alter, add or supplement the information...
                  </p>
                  <p>Click here to ask or see answers from other buyers.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        </div>
      </div>

      {/* Right Sidebar moved outside of snapdeal-below-tabs */}
      <aside className="snapdeal-right-sidebar">
        <div className="seller-card">
          <div className="seller-title">Sold by</div>
          <div className="seller-name">{product.vendorName || 'Store'}</div>
          <div className="seller-rating">
            <span className="stars">★★★★☆</span>
            <span className="rating-count">(3.8)</span>
          </div>
          <div className="seller-links">
            <a href="/" className="view-store">View Store</a>
            <hr/>
            <a href="/sell-on-snapdeal" target="_blank" rel="noopener noreferrer" className="sell-on">Sell On Snapdeal</a>
          </div>
        </div>

        <div className="sidebar-card">
          <div className="sidebar-card-title">Explore More</div>
          <div className="sidebar-card-link">More {product.subcategory || 'Similar'} Products</div>
        </div>

        <div className="sidebar-card">
          <div className="sidebar-card-title">In Same Price</div>
          <div className="sidebar-card-desc">Discover more in this range</div>
        </div>
      </aside>
      </div>
      
      <Footer />
    </>
  );
}

export default ProductDetail;
