import { useSelector, useDispatch } from "react-redux";
import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CheckoutPage.css";
import { clearCart } from "../redux/cartSlice";

function CheckoutPage() {
  const cartItems = useSelector((state) => state.cart.items);
  const user = useSelector((state) => state.user.currentUser) || JSON.parse(localStorage.getItem("currentUser"));
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    fullName: "",
    mobile: "",
    pincode: "",
    house: "",
    city: "",
    state: "",
  });
  const [isSaved, setIsSaved] = useState(false);
  
  useEffect(() => {
    if (!user) {
      alert("Please login to proceed with checkout");
      navigate("/login");
    }
  }, [user, navigate]);


  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSave = () => setIsSaved(true);
  const handleEdit = () => setIsSaved(false);

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
        amount: total,
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

  return (
    <div className="checkout-container">
      <h2 className="checkout-title">Checkout</h2>
      <div className="checkout-grid">
        {/* LEFT SIDE */}
        <div className="checkout-left">
          <div className="checkout-section">
            <h3>Delivery Address</h3>
            <form className="address-form">
              {["fullName","mobile","pincode","house","city","state"].map((field) => (
                <input
                  key={field}
                  type="text"
                  name={field}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={address[field]}
                  onChange={handleChange}
                  disabled={isSaved}
                  required
                />
              ))}
            </form>
            {!isSaved ? (
              <button className="address-btn save-btn" onClick={handleSave}>Save</button>
            ) : (
              <button className="address-btn edit-btn" onClick={handleEdit}>Edit</button>
            )}
          </div>

          <div className="checkout-section">
            <h3>Payment Method</h3>
            <label><input type="radio" name="payment" defaultChecked /> Cash on Delivery</label>
            <label><input type="radio" name="payment" /> UPI / Net Banking / Card</label>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="checkout-right">
          <div className="order-summary">
            <h3>Order Summary</h3>
            {cartItems.map((item, index) => (
              <div key={index} className="order-item">
                <img src={item.image} alt={item.name} />
                <div>
                  <p>{item.name}</p>
                  <span>Qty: {item.quantity}</span>
                </div>
                <p>₹{item.price * item.quantity}</p>
              </div>
            ))}
            <hr />
            <h4>Total: ₹{total}</h4>
            <button
              className="place-order-btn"
              onClick={handlePayment}
              disabled={!isSaved || loading}
            >
              {loading ? "Processing..." : "Proceed to Payment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
