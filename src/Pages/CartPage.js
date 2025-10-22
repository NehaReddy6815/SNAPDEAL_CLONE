import { useSelector } from "react-redux";
import "./CartPage.css";
import { useNavigate } from "react-router-dom";
import Footer from "../components/footer";

function CartPage() {
  const cartItems = useSelector((state) => state.cart.items);
  const navigate = useNavigate();

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <> 
      <div className="cart-page-container">
    <div className="cart-content">

    <div className="cart-headersection">
      {cartItems.length > 0 && (
        <div className="success-notification">
          <div className="notification-content">
            <span className="notification-text">
            <span className="checkmark">✓</span>
              {cartItems[cartItems.length - 1].name} added to your cart
            </span>
            <button className="close-notification">×</button>
          </div>
        </div>
      )}
      <div className="mini-cart-header">
        <div className="mini-cart-content">
          <div className="cart-products">
          {cartItems.length > 0 && (
            <div className="cart-product-preview">
              <img 
                src={cartItems[cartItems.length - 1].image} 
                alt={cartItems[cartItems.length - 1].name} 
                className="product-thumbnail" 
              />
              <div className="product-price">
                Rs. {cartItems[cartItems.length - 1].price}
              </div>
            </div>
          )}
          </div>
        
        <div className="mini-cart-info">
          <div className="cart-count">Your Order ({cartItems.length} Items)</div>
          <div className="cart-total">
            <span className="total-label">You Pay: </span>
            <span className="total-amnt">Rs. {totalPrice}</span>
          </div>
          <div className="cart-note">
            (Including delivery and other charges. View Cart for details)
          </div>
        </div>

        <div className="mini-cart-actions">
          <button className="proceed-btn" onClick={() => navigate("/checkout")}>
            PROCEED TO CHECKOUT
          </button>
          <button className="view-cart-btn" onClick={() => navigate("/view-cart")}>
            VIEW CART
          </button>
        </div>
      </div>
    </div>
    </div>
    </div>
    </div>
    <Footer className="foot"/>
    </>
  );
}

export default CartPage;
