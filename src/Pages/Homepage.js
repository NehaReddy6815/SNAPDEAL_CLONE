import "./Homepage.css"
import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Carousel from "../components/Carousel";
import Footer from "../components/footer";
import RecentlyViewed from "../components/RecentlyViewed";
import TrendingProducts from "../components/TrendingProducts";
import DownloadApp from "../components/downloadapp";
import pincodeImg from "../Assets/pincode.png";

function HomePage() {
  const [pincode, setPincode] = useState("");
  const [pinMsg, setPinMsg] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("selectedPincode");
    if (saved) setPincode(saved);
  }, []);

  const validatePin = (val) => /^\d{6}$/.test(val);

  const handleCheck = async () => {
    setPinMsg("");
    if (!validatePin(pincode)) {
      setPinMsg("Please enter a valid 6-digit pincode");
      return;
    }
    try {
      const res = await axios.post("http://localhost:5000/api/pincode/check", { pincode });
      if (res.data?.available) {
        setPinMsg("Delivery available");
        localStorage.setItem("selectedPincode", pincode);
      } else {
        setPinMsg("Not available");
      }
    } catch (e) {
      setPinMsg("Unable to check pincode");
    }
  };

  return (
    <>
     
      <div className="homepage-container">
        
        <div className="left-column">
          <Sidebar />
          <div className="scanner">
            <div class="nav-bottom-barcode ">
              <div class="bar-code-image barCodImg"></div>
              <div class="bar-code-info">
                <span class="head">Enjoy Convenient Order Tracking</span>
                <span class="desc">Scan to download app</span>
              </div>
            </div>
          </div>
        </div>

        <div className="right-column">
          <div className="top-row">
            <div className="carousel-wrapper" style={{ minWidth: 0, maxWidth: 900 }}>
              <Carousel />
            </div>
            <div className="pincode-card">
              <img src={pincodeImg} alt="Pincode" className="pincode-img" />
              <h7 className="pincode-title"> Your Delivery Pincode</h7>
              <p className="pincode-desc">Enter your pincode to check availability and faster delivery options</p>
              
                <input className="xyz"
                  type="text"
                  placeholder="Enter Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                />
                <button className="submit-btn" onClick={handleCheck}>SUBMIT</button>
              
              {pinMsg && (
                <div style={{ marginTop: 6,fontSize: "10px", color: pinMsg === "Delivery available" ? "#388e3c" : "#d32f2f" }}>
                  {pinMsg}
                </div>
              )}
            </div>
                  
          </div>
          <div className="bottom-row">
            <RecentlyViewed />
          </div>
        </div>
      </div>
      <TrendingProducts />
      <DownloadApp/>
      
      <div><Footer /></div>
    </>
  );
}

export default HomePage;

