import { useSelector, useDispatch } from "react-redux";
import { removeFromCart, increaseQty, decreaseQty, clearCart } from "../redux/cartSlice";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import "./ViewCart.css";

function ViewCart() {
  const cartItems = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [pincode, setPincode] = useState("");
  const [pinMsg, setPinMsg] = useState("");
  const [loading, setLoading] = useState(false);
   
  const user = useSelector((state) => state.user.currentUser) || JSON.parse(localStorage.getItem("currentUser") || "null");

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  
  const deliveryCharge = totalPrice > 500 ? 0 : 40;
  useEffect(() => {
    const saved = localStorage.getItem("selectedPincode");
    if (saved) {
      setPincode(saved);
  
      (async () => {
        try {
          const res = await axios.post("http://localhost:5000/api/pincode/check", { pincode: saved });
          if (res.data?.available) {
            setPinMsg("Delivery available");
          } else {
            setPinMsg("Not available");
          }
        } catch (e) {
          setPinMsg("Unable to check pincode");
        }
      })();
    }
  }, []);
  
  // validate pincode
  const validatePin = (val) => /^\d{6}$/.test(val);
  
  const handleCheckPin = async () => {
    const pin = pincode.trim(); // always take fresh value
    setPinMsg("");
  
    if (!validatePin(pin)) {
      setPinMsg("Please enter a valid 6-digit pincode");
      return;
    }
  
    try {
      const res = await axios.post("http://localhost:5000/api/pincode/check", { pincode: pin });
      if (res.data?.available) {
        setPinMsg("Delivery available");
        localStorage.setItem("selectedPincode", pin);
      } else {
        setPinMsg("Not available");
      }
    } catch (e) {
      setPinMsg("Unable to check pincode");
    }
  };
  
  
  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };
  const address = {
    fullName: user?.name || "User",
    mobile: user?.mobile || "9999999999",
    house: "123",          // You can make a state if you want user to fill house
    city: "Default City",
    state: "Default State",
    pincode: pincode
  };
  
  const handlePayment = async () => {
    // Double-check user and token
    const currentUser = user || JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser || !currentUser.token) {
      alert("Please login to proceed with payment");
      navigate("/login");
      return;
    }

    if (!address.fullName || !address.mobile || !address.pincode || !address.house || !address.city || !address.state) {
      alert("Please fill in all address fields");
      return;
    }

    setLoading(true);

    try {
      const razorpayLoaded = await initializeRazorpay();
      if (!razorpayLoaded) {
        alert("Razorpay SDK failed to load");
        setLoading(false);
        return;
      }

      // Create order on backend
      const orderData = {
        amount: (totalPrice + deliveryCharge) ,
        items: cartItems.map(item => ({
          productId: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
           selectedSize: item.selectedSize || "", // add size
             color: item.color || ""
        })),
        shippingAddress: {
          fullName: address.fullName,
          mobile: address.mobile,
          address: address.house,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          country: "India"
        }
      };

      const { data } = await axios.post(
        "http://localhost:5000/api/payment/create-order",
        orderData,
        { headers: { Authorization: `Bearer ${currentUser.token}` } }
      );

      const options = {
        key: data.key,
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
              dispatch(clearCart());
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
          name: address.fullName || user?.name,
          email: user?.email,
          contact: address.mobile,
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

  if (cartItems.length === 0) {
    return (
      <div className="empty-cart-container">
        <img src="/empty-cart.png" alt="Empty Cart" className="empty-cart-image" />
        <h2 className="empty-cart">Your Shopping Cart is empty</h2>
        <p className="empty-cart-message">Add items to it now.</p>
        <button className="shop-now-btn" onClick={() => navigate("/")}>Shop Now</button>
      </div>
    );
  }

  return (
    <div className="cart-modal">
    <div className="cart-box">
      <div className="cart-box-header">
        <div className="cart-title">
          Shopping Cart ({cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'})
        </div>
        <button className="cart-close" onClick={() => navigate(-1)}>✕</button>
      </div>

      <div className="cart-columns">
        <div>Item Details</div>
        <div>Price</div>
        <div>Quantity</div>
        <div className="avail">
          Showing Availability at <span className="pincode-text">{pincode || "Enter Pincode"}</span>
        </div>
        <div>Subtotal</div>
      </div>

      <div className="cart-items">
        {cartItems.map((item) => (
          <div className="cart-row" key={item._id}>
            <div className="col item-col">
              <img src={item.image} alt={item.name} />
              <div className="item-meta">
                <div className="name">{item.name}</div>
                <button className="remove-link" onClick={() => dispatch(removeFromCart(item._id))}>REMOVE</button>
              </div>
            </div>
            <div className="col price-col">Rs. {item.price}</div>
            <div className="col qty-col">
              <select
                value={item.quantity}
                onChange={(e) => {
                  const q = Number(e.target.value);
                  const current = item.quantity;
                  if (q > current) dispatch(increaseQty(item._id));
                  if (q < current) dispatch(decreaseQty(item._id));
                }}
              >
                {[1, 2, 3].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div className="col avail-col">
              {pinMsg === "Delivery available" ? (
                <div className="pin-note available">Delivery available at this pincode</div>
              ) : pinMsg === "Not available" ? (
                <div className="pin-note unavailable">Sorry! Current seller of the below item(s) does not deliver to your pincode or is out of stock</div>
              ) : (
                <div className="pin-note">Please check pincode availability</div>
              )}
              <button className="change-pin" onClick={handleCheckPin}></button>
            </div>
            <div className="col subtotal-col">Rs. {item.price * item.quantity}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Full width footer */}
    <div className="cart-footer full-width-footer">
      <div className="cart-summary">
        <div className="footer-col">
          <div>Sub Total:</div>
          <div>Delivery Charges:</div>
        </div>
        <div className="footer-col" style={{ textAlign: 'right' }}>
          <div>Rs. {totalPrice}</div>
          <div className={deliveryCharge === 0 ? 'free-delivery' : ''}>
            {deliveryCharge === 0 ? 'FREE' : `Rs. ${deliveryCharge}`}
          </div>
        </div>
      </div >
      <div className="footer-col">
      <button  className="proceedbtn" onClick={handlePayment} disabled={loading}>
        {loading ? "PROCESSING..." : `PROCEED TO PAY RS. ${totalPrice + deliveryCharge}`}
      </button>
      </div>
    </div>
  </div>
  );
}

export default ViewCart;
