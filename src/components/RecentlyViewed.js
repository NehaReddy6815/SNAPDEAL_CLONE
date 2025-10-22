import { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./RecentlyViewed.css";
import { Link } from "react-router-dom";
import RatingDisplay from "./Rating";

function RecentlyViewed() {
  const [products, setProducts] = useState([]);
  const [showPrev, setShowPrev] = useState(false);
  const [showNext, setShowNext] = useState(true);
  const listRef = useRef(null);
  const getAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return sum / reviews.length;
  };
  const updateArrowVisibility = () => {
    if (!listRef.current) return;
    const container = listRef.current;
    setShowPrev(container.scrollLeft > 0);
    setShowNext(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 1
    );
  };

  const scrollTo = (direction) => {
    if (!listRef.current) return;

    const container = listRef.current;
    const scrollAmount = direction === 'next'
      ? container.offsetWidth
      : -container.offsetWidth;

    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    // Get recently viewed product IDs from localStorage
    const ids = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
    if (ids.length === 0) return;
    axios.get(`http://localhost:5000/products?ids=${ids.join(",")}`)
      .then(res => setProducts(res.data))
      .catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    const container = listRef.current;
    if (!container) return;

    updateArrowVisibility();
    const handleScroll = () => {
      updateArrowVisibility();
    };

    container.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [products]);



  if (!products.length) return null;

  return (
    <div className="recently-viewed-section">
      <h3 className="recently-viewed-title">RECENTLY VIEWED PRODUCTS</h3>
      {showPrev && (
        <button className="nav-arrow prev" onClick={() => scrollTo('prev')} aria-label="Previous">
          <svg viewBox="0 0 24 24">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>
      )}
      {showNext && (
        <button className="nav-arrow next" onClick={() => scrollTo('next')} aria-label="Next">
          <svg viewBox="0 0 24 24">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
          </svg>
        </button>
      )}
      <div className="recently-viewed-list" ref={listRef}>
        {products.map(prod => (
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
                <div  className="recently-viewed-rating" >
                   
                <RatingDisplay  value={getAverageRating(prod.reviews)} showValue={false}   readOnly={true}  className="search-rating"  />
                </div>

              <div className="recently-viewed-price">
                
                <span className="original">Rs {Math.round(prod.price * 1.3)}</span>
                <span className="current">Rs {prod.price}</span>
                <span className="recently-viewed-discount">
                {Math.round((1 - prod.price / prod.originalPrice) * 100)}% OFF
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default RecentlyViewed;