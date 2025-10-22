import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import "./OrdersPage.css";

function OrdersPage() {
  // -------------------- STATES --------------------
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [trackOrder, setTrackOrder] = useState(null);
  const [detailsOrder, setDetailsOrder] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("orders");
  const [newPincode, setNewPincode] = useState("");
  const [newName, setNewName] = useState("");
  const [newAddressLine, setNewAddressLine] = useState("");
  const [newLocality, setNewLocality] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("");
  const [newMobile, setNewMobile] = useState("");
  const [newAltMobile, setNewAltMobile] = useState("");
  const [newAddressType, setNewAddressType] = useState("home");
  const [makeDefault, setMakeDefault] = useState(false);
  
  // Addresses
  const [addresses, setAddresses] = useState([
{
     name:"Navya Reddy",
     address:"204 Raichur-584102  KARNATAKA Phone: 9483928222"

    }
  ]);
  const [newAddress, setNewAddress] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");

  // OTP Password reset states
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPasswordOtp, setNewPasswordOtp] = useState("");
  const [loadingOtp, setLoadingOtp] = useState(false);

  // Current user
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser")) || null;
    } catch {
      return null;
    }
  }, []);

  // -------------------- FETCH ORDERS --------------------
  useEffect(() => {
    if (selectedMenu !== "orders") return;

    const fetchOrders = async () => {
      setLoading(true);
      setError("");
      try {
        if (!user?.token) {
          setError("You must be logged in to view orders.");
          return;
        }
        const { data } = await axios.get("http://localhost:5000/api/orders", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setOrders(Array.isArray(data) ? data : data.orders || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?.token, selectedMenu]);

  // -------------------- CANCEL ORDER --------------------
  const handleCancel = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await axios.put(
        `http://localhost:5000/api/orders/${orderId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, orderStatus: "cancelled" } : o
        )
      );
      alert("Order cancelled successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to cancel order");
    }
  };

  // -------------------- ADD NEW ADDRESS --------------------
  const handleSaveAddress = () => {
    if (!newAddress.trim()) return alert("Enter address");
    setAddresses([
      ...addresses,
      { id: Date.now(), name: "New", address: newAddress },
    ]);
    setNewAddress("");
  };

  // -------------------- EDIT ADDRESS --------------------
  const handleEdit = (id, currentValue) => {
    setEditingId(id);
    setEditingValue(currentValue);
  };

  const handleUpdateAddress = () => {
    if (!editingValue.trim()) return alert("Enter address");
    setAddresses((prev) =>
      prev.map((addr) =>
        addr.id === editingId ? { ...addr, address: editingValue } : addr
      )
    );
    setEditingId(null);
    setEditingValue("");
  };

  const handleDeleteAddress = (id) => {
    if (!window.confirm("Delete this address?")) return;
    setAddresses((prev) => prev.filter((addr) => addr.id !== id));
  };

  // -------------------- OTP PASSWORD RESET FOR LOGGED-IN USER --------------------
  const handleSendOtp = async () => {
    if (!newPasswordOtp.trim()) return alert("Enter new password");

    try {
      setLoadingOtp(true);
      const { data } = await axios.post(
        "http://localhost:5000/otproutes/send-otp-loggedin",
        { password: newPasswordOtp },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert(data.message);
      setOtpSent(true);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoadingOtp(false);
    }
  };

  const handleResetPasswordWithOtp = async () => {
    if (!otp.trim() || !newPasswordOtp.trim()) return alert("Enter OTP and new password");

    try {
      setLoadingOtp(true);
      const { data } = await axios.put(
        "http://localhost:5000/authroutes/reset-password-loggedin",
        { otp, newPassword: newPasswordOtp },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert(data.message);
      setOtp("");
      setNewPasswordOtp("");
      setOtpSent(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoadingOtp(false);
    }
  };

  // -------------------- ORDER TRACKING --------------------
  const stages = [
    { key: "placed", label: "Placed" },
    { key: "packed", label: "Packed" },
    { key: "shipped", label: "Shipped" },
    { key: "outForDelivery", label: "Out For Delivery" },
    { key: "delivered", label: "Delivered" },
  ];

  const computeReachedIndex = (order) => {
    const status = (order?.orderStatus || "pending").toLowerCase();
    if (status === "cancelled") return -1;
    switch (status) {
      case "delivered":
        return 4;
      case "shipped":
        return 2;
      case "processing":
        return 1;
      default:
        return 0;
    }
  };

  // -------------------- RENDER --------------------
  return (
    <div className="orders-page">
      {/* -------------------- SIDEBAR -------------------- */}
      <div className="account-sidebar">
        <div className="account-header">My Account</div>
        <div className="account-user">
          <div className="avatar-circle">
            {user?.name?.[0]?.toUpperCase() ||
              user?.email?.[0]?.toUpperCase() ||
              "U"}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.name || "User"}</div>
            <div className="user-email">{user?.email}</div>
          </div>
        </div>

        <div className="account-menu">
          <div className="menu-section">ORDERS</div>
          <div
            className={`menu-item ${selectedMenu === "orders" ? "active" : ""}`}
            onClick={() => setSelectedMenu("orders")}
          >
            Orders
          </div>

          <div className="menu-section">PROFILE</div>
          <div
            className={`menu-item ${selectedMenu === "addresses" ? "active" : ""}`}
            onClick={() => setSelectedMenu("addresses")}
          >
            Saved Addresses
          </div>
          <div className="menu-item">Saved Cards</div>
          <div
            className={`menu-item ${selectedMenu === "password" ? "active" : ""}`}
            onClick={() => setSelectedMenu("password")}
          >
            Change Password
          </div>

          <div className="menu-section">PAYMENTS</div>
          <div className="menu-item">E-Gift Voucher Balance</div>
        </div>
      </div>

      {/* -------------------- RIGHT SIDE CONTENT -------------------- */}
      <div className="orders-content">
        {/* -------------------- ORDERS -------------------- */}
        {selectedMenu === "orders" && (
          <>
            <h5 className="orders-title">My Orders</h5>
            {loading && <p>Loading...</p>}
            {error && <p className="error-text">{error}</p>}
            {!loading && !error && orders.length === 0 && <p>No orders found.</p>}

            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-card-header">
                  <div>
                    <span className="muted">Order ID:</span>{" "}
                    <b>{order.orderId || order._id}</b>
                  </div>
                  <button
                    className="details-btn"
                    onClick={() => setDetailsOrder(order)}
                  >
                    DETAILS
                  </button>
                </div>

                <div className="order-meta muted">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </div>

                <div className="order-main">
                  <div className="order-product">
                    <img
                      src={order.items?.[0]?.productId?.image || order.items?.[0]?.image}
                      alt={order.items?.[0]?.productId?.name || order.items?.[0]?.name}
                    />
                  </div>
                  <div className="order-info">
                    <div className="order-name">
                      {order.items?.[0]?.productId?.name || order.items?.[0]?.name}
                      {order.items && order.items.length > 1
                        ? ` +${order.items.length - 1} more`
                        : ""}
                    </div>
                    <div className="order-variant muted">
                      <span>Size: {order.items?.[0]?.selectedSize || order.items?.[0]?.size || "-"}</span>
                      <span className="divider">|</span>
                      <span>Color: {order.items?.[0]?.color || order.items?.[0]?.productId?.color || "-"}</span>
                    </div>

                    <div className="order-actions">
                      {order.orderStatus !== "cancelled" && (
                        <button className="ghost-btn" onClick={() => handleCancel(order._id)}>
                          CANCEL
                        </button>
                      )}
                      <button className="track-btn" onClick={() => setTrackOrder(order)}>
                        TRACK
                      </button>
                    </div>
                  </div>
                </div>

                <div className="order-timeline">
                  {stages.map((stage, idx) => {
                    const reached = computeReachedIndex(order);
                    return (
                      <div key={stage.key} className={`tl-item ${idx <= reached ? "active" : ""}`}>
                        <div className="tl-dot" />
                        <div className="tl-label">{stage.label}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="order-footer">
                  <div className="status">
                    <span
                      className={`status-pill ${
                        order.orderStatus === "cancelled"
                          ? "red"
                          : order.paymentStatus === "completed"
                          ? "green"
                          : "orange"
                      }`}
                    >
                      {order.orderStatus === "cancelled"
                        ? "ORDER CANCELLED"
                        : order.paymentStatus === "completed"
                        ? "ORDER CONFIRMED"
                        : (order.paymentStatus || "PENDING").toUpperCase()}
                    </span>
                  </div>
                  <div className="est-delivery muted">
                    Est. Delivery: {new Date(new Date(order.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* -------------------- ADDRESSES -------------------- */}
        {/* -------------------- ADDRESSES -------------------- */}
        {selectedMenu === "addresses" && (
  <>
    <h5 className="orders-title">Saved Addresses</h5>
    
    <ul>
      {addresses.map((addr) => (
        <li key={addr.id}>
          {editingId === addr.id ? (
            <div className="address-edit-container">
              <input
                type="text"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                placeholder="Edit address"
              />
              <div className="address-buttons">
                <button onClick={handleUpdateAddress}>Save</button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="address-display-container">
              <span><b>{addr.name}:</b> {addr.address}</span>
              <div className="address-buttons">
                <button onClick={() => handleEdit(addr.id, addr.address)}>Edit</button>
                <button onClick={() => handleDeleteAddress(addr.id)}>Delete</button>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>

    {/* Button to show form */}
    {!showNewAddressForm && (
      <button className="add-address-btn" onClick={() => setShowNewAddressForm(true)}>
        ADD NEW ADDRESS
      </button>
    )}

    {/* New Address Form */}
    {showNewAddressForm && (
      <div className="new-address-form">
        
        <input
          type="text"
          placeholder="Pincode (6 digits)"
          value={newPincode}
          onChange={(e) => setNewPincode(e.target.value)}
        />
        <input
          type="text"
          placeholder="Full Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Flat/House No., Colony/Street No."
          value={newAddressLine}
          onChange={(e) => setNewAddressLine(e.target.value)}
        />
        <input
          type="text"
          placeholder="Locality/Landmark (Eg Near Fortis Hospital)"
          value={newLocality}
          onChange={(e) => setNewLocality(e.target.value)}
        />
        <input
          type="text"
          placeholder="City"
          value={newCity}
          onChange={(e) => setNewCity(e.target.value)}
        />
        <input
          type="text"
          placeholder="State"
          value={newState}
          onChange={(e) => setNewState(e.target.value)}
        />
        <input
          type="text"
          placeholder="Mobile Number (Same as registered +91)"
          value={newMobile}
          onChange={(e) => setNewMobile(e.target.value)}
        />
        <input
          type="text"
          placeholder="Alternate Mobile No. (+91)"
          value={newAltMobile}
          onChange={(e) => setNewAltMobile(e.target.value)}
        />
        <select
          value={newAddressType}
          onChange={(e) => setNewAddressType(e.target.value)}
        >
          <option value="home">Home</option>
          <option value="office">Office/Commercial</option>
        </select>
        <label>
          <input
            type="checkbox"
            checked={makeDefault}
            onChange={(e) => setMakeDefault(e.target.checked)}
          />
          Make this my default address
        </label>
        <div className="address-buttons">
          <button onClick={handleSaveAddress}>Save</button>
          <button onClick={() => setShowNewAddressForm(false)}>Cancel</button>
        </div>
      </div>
    )}
  </>
)}


        {/* -------------------- CHANGE PASSWORD -------------------- */}
        {selectedMenu === "password" && (
  <>
    <h5 className="orders-title">Change Password</h5>

    {!otpSent ? (
      <>
        <input
          type="password"
          placeholder="Enter New Password"
          value={newPasswordOtp}
          onChange={(e) => setNewPasswordOtp(e.target.value)}
        />
        <button
          onClick={handleSendOtp}
          disabled={loadingOtp || !newPasswordOtp.trim()}
        >
          {loadingOtp ? "Sending OTP..." : "Submit"}
        </button>
      </>
    ) : (
      <>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <button
          onClick={handleResetPasswordWithOtp}
          disabled={loadingOtp || !otp.trim()}
        >
          {loadingOtp ? "Updating..." : "Verify OTP"}
        </button>
      </>
    )}
  </>
)}


        {/* -------------------- TRACK MODAL -------------------- */}
        {trackOrder && (
          <div className="modal" onClick={() => setTrackOrder(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>Tracking Order {trackOrder.orderId || trackOrder._id}</div>
                <button className="close-x" onClick={() => setTrackOrder(null)}>×</button>
              </div>
              <div className="track-modal-body">
                <div className="timeline-vertical">
                  {stages.map((stage, idx) => {
                    const reached = computeReachedIndex(trackOrder);
                    return (
                      <div key={stage.key} className={`v-item ${idx <= reached ? "active" : ""}`}>
                        <div className="v-dot" />
                        <div className="v-text">
                          <div className="v-title">{stage.label}</div>
                          <div className="v-date muted">{idx === 0 ? new Date(trackOrder.createdAt).toLocaleString() : "Pending"}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------- DETAILS MODAL -------------------- */}
        {detailsOrder && (
          <div className="modal" onClick={() => setDetailsOrder(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>Order Details: {detailsOrder.orderId || detailsOrder._id}</div>
                <button className="close-x" onClick={() => setDetailsOrder(null)}>×</button>
              </div>
              <div className="track-modal-products">
              {detailsOrder.items?.map((item, idx) => {
  const product = item.productId || item;
  return (
    <div key={idx} className="track-modal-product">
      <img src={product.image} alt={product.name} style={{ width: 80, height: 80, objectFit: "cover" }} />
      <div>Name: {product.name}</div>
      <div>Price: ₹{item.price || product.price}</div>
      <div>Size: {item.selectedSize || item.size || product.selectedSize || "-"}</div>
      <div>Color: {item.color || product.color || "-"}</div>
      <div>Quantity: {item.quantity || 1}</div>
    </div>
  );
})}

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrdersPage;
