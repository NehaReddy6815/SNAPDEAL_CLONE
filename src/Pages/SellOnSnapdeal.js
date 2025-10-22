import React, { useState } from "react";
import "./SellOnSnapdeal.css";

export default function SellOnSnapdeal() {
  const [mobile, setMobile] = useState("");
  const openSellerLogin = () => {
    window.open('/seller-login', '_blank');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder submit
    alert(`Thanks! We'll contact ${mobile}`);
  };

  return (
    <div className="sos-wrap">
      <header className="sos-header">
        <img className="sos-logo" src="https://setu.snapdeal.com/_next/image?url=%2Fassets%2Ficons%2FsdLogo.png&w=640&q=75" alt="snapdeal"/>
        <div className="sos-cta">
        <h6 style={{ marginTop: "14px" }}>Already a user?</h6>
          <button className="sos-btn ghost" onClick={openSellerLogin}>Login</button>
          <button className="sos-btn primary">Start Selling</button>
        </div>
      </header>

      <section className="sos-hero">
        <div className="sos-hero-left">
          <h1>Start Selling on Snapdeal</h1>
          <h2>at -</h2>
          <h1 className="sos-accent">0% Commission<span className="sos-star">*</span></h1>
          <h6 style={{display:"block"}}>Enter Mobile No:</h6>
          <form className="sos-form" onSubmit={handleSubmit}>
            
            <input
              type="tel"
              placeholder="+91"
              maxLength={10}
              value={mobile}
              onChange={(e)=>setMobile(e.target.value.replace(/[^0-9]/g, "").slice(0,10))}
            />
            <button type="submit" className="sos-btn primary">Start Selling</button>
          </form>
        </div>
        <div className="sos-hero-right">
          <div className="sos-zero">0%</div>
          <div className="sos-bullets right">
            <h3>Registration Fees</h3>
            <h3>Cancellation Fees</h3>
            <h3>Closing Fee</h3>
            <h3>RTO Fees</h3>
          </div>
        </div>
      </section>

      <section className="sos-stats">
        <div className="sos-stat">
          <div className="icon"/> 
          <div>
            <div className="title">Crores of</div>
            <div className="desc">Customers buying across India</div>
          </div>
        </div>
        <div className="sos-stat">
          <div className="icon"/> 
          <div>
            <div className="title">Lakhs of</div>
            <div className="desc">Trusted Sellers on Snapdeal</div>
          </div>
        </div>
        <div className="sos-stat">
          <div className="icon"/> 
          <div>
            <div className="title">Thousands of</div>
            <div className="desc">Pincodes supported for delivery</div>
          </div>
        </div>
        <div className="sos-stat">
          <div className="icon"/> 
          <div>
            <div className="title">Hundreds of</div>
            <div className="desc">Categories to sell online</div>
          </div>
        </div>
      </section>

      <section className="sos-steps">
        <h2>How to sell on Snapdeal</h2>
        <div className="sos-steps-grid">
          <div className="sos-step">
            <img alt="register" src="https://setu.snapdeal.com/_next/image?url=%2Fassets%2Fimages%2Fregister.png&w=640&q=75"/>
            <h3>1. Register yourself</h3>
            <p>Enter basic details like Mobile Number, Email, GST & Bank Details</p>
          </div>
          <div className="sos-step">
            <img alt="store details" src="https://setu.snapdeal.com/_next/image?url=%2Fassets%2Fimages%2Fstore.png&w=640&q=75"/>
            <h3>2. Store Details</h3>
            <p>Enter store details like seller code, pickup address and other information</p>
          </div>
          <div className="sos-step">
            <img alt="list products" src="https://setu.snapdeal.com/_next/image?url=%2Fassets%2Fimages%2Flist.png&w=640&q=75"/>
            <h3>3. List your products</h3>
            <p>List your product, and enter brand details and start selling</p>
          </div>
          <div className="sos-step">
            <img alt="payments" src="https://setu.snapdeal.com/_next/image?url=%2Fassets%2Fimages%2Fpayments.png&w=640&q=75"/>
            <h3>4. Payments</h3>
            <p>Get your payments after 7 days of receiving the order</p>
          </div>
        </div>
      </section>
    </div>
  );
}


