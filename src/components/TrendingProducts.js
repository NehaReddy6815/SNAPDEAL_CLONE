import { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./TrendingProducts.css";
import { Link } from "react-router-dom";
import RatingDisplay from "./Rating";

function TrendingProducts() {
  const [products, setProducts] = useState([]);
  const scrollContainerRef = useRef(null);
  const getAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return sum / reviews.length;
  };
  // const scrollLeft = () => {
  //   if (scrollContainerRef.current) {
  //     scrollContainerRef.current.scrollBy({ left: -220, behavior: 'smooth' });
  //   }
  // };

  // const scrollRight = () => {
  //   if (scrollContainerRef.current) {
  //     scrollContainerRef.current.scrollBy({ left: 220, behavior: 'smooth' });
  //   }
  // };
// const scrollLeft = () => {
//   if (scrollContainerRef.current) {
//     const container = scrollContainerRef.current;
//     const cardWidth = container.querySelector(".trending-card").offsetWidth;
//     const cardsToScroll = 3; // scroll 3 cards at a time
//     container.scrollBy({ left: -cardWidth * cardsToScroll, behavior: "smooth" });
//   }
// };

// const scrollRight = () => {
//   if (scrollContainerRef.current) {
//     const container = scrollContainerRef.current;
//     const cardWidth = container.querySelector(".trending-card").offsetWidth;
//     const cardsToScroll = 3; // scroll 3 cards at a time
//     container.scrollBy({ left: cardWidth * cardsToScroll, behavior: "smooth" });
//   }
// };
const scrollLeft = () => {
  if (scrollContainerRef.current) {
    const container = scrollContainerRef.current;
    const scrollAmount = container.offsetWidth; // scroll width of visible area
    container.scrollBy({ left: -scrollAmount, behavior: "smooth" }); // scroll left
  }
};

const scrollRight = () => {
  if (scrollContainerRef.current) {
    const container = scrollContainerRef.current;
    const scrollAmount = container.offsetWidth; // scroll width of visible area
    container.scrollBy({ left: scrollAmount, behavior: "smooth" }); // scroll right
  }
};


  useEffect(() => {
    axios.get("http://localhost:5000/products?limit=10") // Get 10 products for trending section
      .then(res => {
        // Randomly shuffle products to simulate trending items
        const shuffled = [...res.data].sort(() => 0.5 - Math.random());
        setProducts(shuffled);
      })
      .catch(() => setProducts([]));
  }, []);

  return (
    <div className="trending-section">
      <h3 className="trending-title">TRENDING PRODUCTS</h3>
      <div className="nav-arrow prev" onClick={scrollLeft}>
        <svg viewBox="0 0 24 24">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
        </svg>
      </div>
      <div className="nav-arrow next" onClick={scrollRight}>
        <svg viewBox="0 0 24 24">
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
        </svg>
      </div>
      <div className="trending-list" ref={scrollContainerRef}>
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

export default TrendingProducts;
