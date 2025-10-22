
import logo from "../Assets/logo.png"
import "./Navbar.css";
import { FaUser, FaShoppingCart, FaBox } from "react-icons/fa";
import { useState, useEffect } from "react";
import LoginForm from "./Loginform";
import RegisterForm from "./Register";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import { useLocation } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();
    const cartCount = useSelector((state) => state.cart.items.length);
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [username, setUsername] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const location = useLocation();
    const isHome = location.pathname === "/";

    const trendingSearches = [
        "T-shirts",
        "Cookware Sets",
        "Formal Shoes",
        "Home & Kitchen",
        "Soft Toys"
    ];
    const handleSearchClick = (keyword) => {
        navigate(`/search?q=${encodeURIComponent(keyword)}`);
        setSearchQuery("");       // optional, clears input
        setShowSuggestions(false);
    };

    const [isSearching] = useState(false);
    useEffect(() => {
        const storedUser = localStorage.getItem("currentUser");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser?.username) {
                setUsername(parsedUser.username);
            }
        }
    }, []);

    const handleLogout = () => {

        localStorage.removeItem("currentUser");
        setUsername(null);
        window.location.href = "/";
    };

    return (
        <nav className="navbar sticky-top">
            <Link to='/' >
                <div className="navbar-left">
                    <img src={logo} alt="Snapdeal Logo" style={{ height: "30px" }} />

                </div>
            </Link>
            {!isHome && (
 <div
 className="hamburger"
 onMouseEnter={() => {
   clearTimeout(window.sidebarTimeout); // cancel previous close
   setShowSidebar(true);
 }}
 onMouseLeave={() => {
   window.sidebarTimeout = setTimeout(() => {
     setShowSidebar(false);
   }, 5000); // 5 sec delay
 }}
>
 <div className="line"></div>
 <div className="line"></div>
 <div className="line"></div>

 {showSidebar && (
   <div
     className="sidebar-overlayy"
     onMouseEnter={() => {
       clearTimeout(window.sidebarTimeout);
       setShowSidebar(true);
     }}
     onMouseLeave={() => {
       window.sidebarTimeout = setTimeout(() => {
         setShowSidebar(false);
       }, 3000);
     }}
   >
     <Sidebar closeSidebar={() => setShowSidebar(false)} />
   </div>
 )}
</div>

)}

           

            <div className="navbar-center">
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search products & brands"
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && searchQuery.trim()) {
                                handleSearchClick(searchQuery.trim());
                            }
                        }}
                    />

                    <button
                        className={`search-btn ${isSearching ? 'searching' : ''}`}
                        onClick={() => {
                            if (searchQuery.trim()) {
                                navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                            }
                        }}
                        disabled={isSearching}
                    >
                        {isSearching ? 'Searching...' : 'Search'}
                    </button>
                    {showSuggestions && (
                        <div className="suggestions">
                            {(searchQuery
                                ? trendingSearches.filter(item =>
                                    item.toLowerCase().includes(searchQuery.toLowerCase())
                                )
                                : trendingSearches
                            ).map((item, idx) => (
                                <div
                                    key={idx}
                                    className="suggestion-item"
                                    onMouseDown={() => handleSearchClick(item)} // use onMouseDown to avoid blur issue
                                >
                                    {item}
                                </div>
                            ))}
                        </div>
                    )}

                </div>
                <Link to="/cart" className="cart-btn">
                    Cart
                    <FaShoppingCart />
                    {cartCount > 0 && <span className="cart-count-badge">{cartCount}</span>}
                </Link>
                <div className="dropdownWrapper">
                    <button className="sign-in"><span>{username ? username : "Sign In"}</span> <FaUser /></button>

                    <div className="dropdownAccount">
                        <ul className="accountList">
                            <li><FaUser /><span>Your Account</span></li>
                            <li>
                                <Link to="/orders" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                                    <FaBox style={{ marginRight: 4 }} />
                                    <span>Your Orders</span>
                                </Link>
                            </li>
                            <hr />

                            {!username ? (
                                <>
                                    <li>
                                        <div className="register-link" onClick={() => setShowRegister(true)}
                                            style={{ cursor: "pointer" }}>
                                            <span>If you are new user</span>
                                            <div className="register-text">Register</div>
                                        </div>
                                    </li>

                                    <li>
                                        <button className="login-btn" onClick={() => setShowLogin(true)}>Log In</button>
                                    </li>
                                </>
                            ) : (
                                <li>
                                    <button className="login-btn" onClick={handleLogout}>Logout</button>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            {showLogin && !username && (
                <div className="overlay">
                    <div className="login-popup">
                        <span className="close-btn" onClick={() => setShowLogin(false)}>x</span>
                        <LoginForm setUsername={setUsername} />
                    </div>
                </div>
            )}
            {showRegister && !username && (
                <div className="overlay">
                    <div className="login-popup">
                        <span className="close-btn" onClick={() => setShowRegister(false)}>x</span>
                        <RegisterForm setUsername={setUsername} />
                    </div>
                </div>
            )}

        </nav>
    );
}

export default Navbar;