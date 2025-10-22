import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { useState } from 'react';
import "./Rating.css";

function RatingDisplay({ value, showValue = true, onRate, totalReviews, readOnly = true }) {
  const [hoverValue, setHoverValue] = useState(0);
  const stars = [];

  const handleMouseOver = (starValue) => {
    if (!readOnly) {
      setHoverValue(starValue);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverValue(0);
    }
  };

  const handleClick = (starValue) => {
    if (!readOnly && onRate) {
      onRate(starValue);
    }
  };

  for (let i = 1; i <= 5; i++) {
    const displayValue = hoverValue || value;
    let Star;
    if (displayValue >= i) {
      Star = FaStar;
    } else if (displayValue >= i - 0.5) {
      Star = FaStarHalfAlt;
    } else {
      Star = FaRegStar;
    }

    stars.push(
      <Star
        key={i}
        color="#ffc107"
        className={!readOnly ? "star-interactive" : ""}
        onMouseOver={() => handleMouseOver(i)}
        onMouseLeave={handleMouseLeave}
        onClick={() => handleClick(i)}
        style={{ cursor: readOnly ? 'default' : 'pointer' }}
      />
    );
  }

  return (
    <div className="rating-container">
      <div className="stars-container">
        {stars}
      </div>
      {showValue && (
        <div className="rating-info">
          <span className="rating-value">
            {value ? value.toFixed(1) : "0.0"}
          </span>
          {totalReviews !== undefined && (
            <span className="total-reviews">
              ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default RatingDisplay;
