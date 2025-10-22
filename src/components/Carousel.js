import { useEffect } from "react";
import "./carousel.css";
import {Link} from "react-router-dom"
function Carousel() {
  useEffect(() => {
    const carousel = document.getElementById("snapCarousel");

    const handleSlide = (e) => {
      const index = e.to; 
      const items = document.querySelectorAll(".carousel-description li");

      items.forEach((item, i) => {
        if (i === index) {
          item.classList.add("active");
        } else {
          item.classList.remove("active");
        }
      });
    };

    carousel.addEventListener("slid.bs.carousel", handleSlide);

    return () => {
      carousel.removeEventListener("slid.bs.carousel", handleSlide);
    };
  }, []);

  return (
    <div
      id="snapCarousel"
      className="carousel slide"
      data-bs-ride="carousel"
    >
      {/* Images */}
      <div className="carousel-inner">
        <div className="carousel-item active">
          <img src="https://g.sdlcdn.com/imgs/k/z/2/Snapdeal_New_Website_home_page_8-73a30.png" className="d-block w-100 carousel-img" alt="Slide 1" />
        </div>
        <div className="carousel-item">
        <Link to="/products?category=Women's Fashion">
          <img src="https://g.sdlcdn.com/imgs/k/z/g/ondcfestivebanner-ee807.jpg" className="d-block w-100 carousel-img" alt="Slide 2" />
          </Link></div>
        <div className="carousel-item">
        <Link to="/products?subcategory=Sports Shoes">
          <img src="https://g.sdlcdn.com/imgs/l/b/q/StepIntoFestivitydesktop1825-3e105.jpg" className="d-block w-100 carousel-img" alt="Slide 3" />
          </Link>
        </div>
        <div className="carousel-item">
        <Link to="/products?category=Women's Fashion">
          <img src="https://g.sdlcdn.com/imgs/k/z/g/ondcfestivebanner-ee807.jpg" className="d-block w-100 carousel-img" alt="Slide 4" />
          </Link>
        </div>
        <div className="carousel-item">
          <Link to="/products?category=Home & Kitchen">
          <img src="https://g.sdlcdn.com/imgs/l/b/q/FestiveTadkadesktop1825-4d320.jpg" className="d-block w-100 carousel-img" alt="Slide 5" />
          </Link>
        </div>
      </div>

     
      <button className="carousel-control-prev" type="button" data-bs-target="#snapCarousel" data-bs-slide="prev">
        <span className="carousel-control-prev-icon"></span>
      </button>
      <button className="carousel-control-next" type="button" data-bs-target="#snapCarousel" data-bs-slide="next">
        <span className="carousel-control-next-icon"></span>
      </button>

      
      <div className="carousel-description">
        <ul>
          <li data-bs-target="#snapCarousel" data-bs-slide-to="0" className="active">BOB CARD</li>
          <li data-bs-target="#snapCarousel" data-bs-slide-to="1">India @100:Envisioning to...</li>
          <li data-bs-target="#snapCarousel" data-bs-slide-to="2">Sports Footwear</li>
          <li data-bs-target="#snapCarousel" data-bs-slide-to="3">Ethnic Wear</li>
          <li data-bs-target="#snapCarousel" data-bs-slide-to="4">Kitchenware</li>
        </ul>
      </div>
    </div>
  );
}

export default Carousel;
