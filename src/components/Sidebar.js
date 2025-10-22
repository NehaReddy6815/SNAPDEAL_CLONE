import { FaSearch } from "react-icons/fa";
import "./Sidebar.css";
import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";

function Sidebar() {
  const [hoverIndex, setHoverIndex] = useState(null);
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const flyoutTimeout = useRef();
  const navigate = useNavigate();

  const categories = [
    {
      name: "Men's Fashion",
      image: "https://g.sdlcdn.com/imgs/k/v/x/Men_sitenavigation-b972a.jpg",
      sub: [
        { items: ["CLOTHING","T-Shirts", "Shirts"] },
        { items: ["FOOTWEAR","Formal Shoes", "Sports Shoes"] },
      ],
       imageUrl: "https://g.sdlcdn.com/imgs/i/1/o/MF-05994.jpg"
    },
    {
      name: "Women's Fashion",
      image: "https://g.sdlcdn.com/imgs/k/v/x/WoMen_sitenav-5a8ca.jpg",
      sub: [
        { items: ["CLOTHING","Tops", "Sarees"] },
        { items: ["FOOTWEAR","Heels", "Flats", "Sandals"] },
        // { items: ["JEWELLERY","Earrings", "Necklaces", "Bangles", "Rings"] },
      ],
      imageUrl:"https://g.sdlcdn.com/imgs/i/n/g/MS_WomenWatches_LeftNav1Aug-e15a1.jpg"
    },
    {
      name: "Home & Kitchen",
      image: "https://g.sdlcdn.com/imgs/k/v/x/HOme_sitenavigation-d7a00.jpg",
      sub: [
        { items: ["KITHCHEN TOOLS","Pans", "Cookware Sets"] },
        { items: ["HOME DECOR","Wall Art", "Vases"] },
      ],
      imageUrl:"https://g.sdlcdn.com/imgs/i/1/r/GM_28oct-e8cd1.jpg"
    },
    {
      name: "Toys, Kids' Fashion",
      image: "https://g.sdlcdn.com/imgs/k/v/x/Toys_Sitenavigation-ef666.jpg",
      sub: [
        { items: ["TOYS","Puzzles", "Soft Toys"] },
        { items: ["KIDS","Dresses&Frocks", "Pajamas"] },
      ],
      imageUrl:"https://g.sdlcdn.com/imgs/i/1/o/toys-7fc92.jpg"
    },
    {
      name: "Beauty, Health",
      image: "https://g.sdlcdn.com/imgs/k/v/x/Beauty_Site_navigation-5f3be.jpg",
      sub: [
        { items: ["SKIN CARE","Moisturizers", "Face Wash"] },
        { items: ["PERSONAL CARE" ,"Shampoo", "Soap"] },
      ],
      imageUrl:"	https://g.sdlcdn.com/imgs/i/x/e/Beauty_2912-5548d.jpg"
    },
  ];

  // const handleSubcategoryTap = (sub) => {
  //   navigate(`/products?subcategory=${encodeURIComponent(sub)}`);
  // };


  const handleSubcategoryTap = (item, i, parentCategory) => {
    if (i === 0) {
      // First item → fetch all products in parent category
      navigate(`/products?category=${encodeURIComponent(parentCategory)}`);
    } else {
      // Other items → fetch products in subcategory
      navigate(`/products?subcategory=${encodeURIComponent(item)}`);
    }
  };
  
  
  const handleMouseEnter = (idx) => {
    clearTimeout(flyoutTimeout.current);
    setHoverIndex(idx);
    setFlyoutOpen(true);
  };

  const handleMouseLeave = () => {
    flyoutTimeout.current = setTimeout(() => {
      setHoverIndex(null);
      setFlyoutOpen(false);
    }, 180);
  };

  return (
    <div className="sidebar">
      <h6 className="sidebar-title">TOP CATEGORIES</h6>
      <ul className="sidebar-list">
        {categories.map((cat, idx) => (
          <li
            key={cat.name}
            onMouseEnter={() => handleMouseEnter(idx)}
            onMouseLeave={handleMouseLeave}
            className="sidebar-category-item"
          >
            <img src={cat.image} alt={cat.name} className="category-icon" />
            <span className={hoverIndex === idx ? "active" : ""}>
              {cat.name}
            </span>

            {hoverIndex === idx && flyoutOpen && (
              <div
                className="sidebar-flyout"
                onMouseEnter={() => clearTimeout(flyoutTimeout.current)}
                onMouseLeave={handleMouseLeave}
              >
               <ul className="sidebar-sublist">
  {cat.sub.map((subCat) =>
    subCat.items.map((item, i) => (
      <li
        key={item}
        onClick={() => handleSubcategoryTap(item, i,cat.name)}
        onTouchStart={() => handleSubcategoryTap(item, i,cat.name)}
        style={{ fontWeight: i === 0 ? "600" : "400" }} // First item bold
      >
        {item}
      </li>
    ))
  )}
</ul>
    {/* Category image */}
    {cat.imageUrl && (
      <div className="sidebar-image" >
        <img
          src={cat.imageUrl} // dynamic image per category
          alt={cat.name}
          
        />
      </div>
    )}

              </div>
            )}
          </li>
        ))}
      </ul>

      

<h6 className="sidebar-title">MORE CATEGORIES</h6>
<ul className="sidebar-list text-only">
  <li>
    <Link to={`/products?category=Automotives`} className="sidebar-link">Automotives</Link>
  </li>
  <li>
    <Link to={`/products?category=Mobile & Accessories`} className="sidebar-link">Mobile & Accessories</Link>
  </li>
  <li>
    <Link to={`/products?category=Electronics`} className="sidebar-link">Electronics</Link>
  </li>
  <li>
    <Link to={`/products?category=Sports, Fitness & Outdoor`} className="sidebar-link">Sports, Fitness & Outdoor</Link>
  </li>
  <li>
    <Link to={`/products?category=Computers & Gaming`} className="sidebar-link">Computers & Gaming</Link>
  </li>
  <li>
    <Link to={`/products?category=Books, Media & Music`} className="sidebar-link">Books, Media & Music</Link>
  </li>
  <li>
    <Link to={`/products?category=Hobbies`} className="sidebar-link">Hobbies</Link>
  </li>
</ul>


      <h6 className="sidebar-title">TRENDING SEARCHES</h6>
      <ul className="sidebar-list text-only">
     
  <li>
    <Link to={`/products?category=Beauty, Health`} className="sidebar-link"><FaSearch/>Beauty, Health</Link>
  </li>
  <li>
    <Link to={`/products?category=Hobbies`} className="sidebar-link"><FaSearch/>Hobbies</Link>
  </li>
  <li>
    <Link to={`/products?category=Home & Kitchen`} className="sidebar-link"><FaSearch/>Home & Kitchen</Link>
  </li>
      </ul>
    </div>
  );
}

export default Sidebar;
