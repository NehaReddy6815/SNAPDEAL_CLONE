import React, { useState } from "react";
import "./SellerLogin.css";
import { useNavigate } from "react-router-dom";

export default function SellerLogin() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder for real auth flow
    alert(`Proceeding to password login for: ${username}`);
  };

  return (
    <div className="seller-login-wrap">
      <header className="seller-login-header">
        <img
          className="seller-logo"
          src="https://setu.snapdeal.com/_next/image?url=%2Fassets%2Ficons%2FsdLogo.png&w=640&q=75"
          alt="snapdeal"
        />
        <div className="seller-login-actions">
          <div className="seller-login-text">New User?</div>
          <button className="seller-btn outline" onClick={() => navigate('/sell-on-snapdeal')}>Register</button>
        </div>
      </header>

      <div className="seller-login-content">
        <div className="seller-login-left">
          <div className="seller-welcome">Welcome to Snapdeal</div>
          <h1 className="seller-title">Login with Your Username</h1>
          <div className="seller-field-label">Mobile/ Email / Seller Code</div>
          <form onSubmit={handleSubmit} className="seller-form">
            <input
              className="seller-input"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <button type="submit" className="seller-btn primary">
              Login with Password
            </button>
          </form>
        </div>

        <div className="seller-login-right">
          <img
            className="seller-illustration"
            alt="illustration"
            src="https://setu.snapdeal.com/_next/image?url=%2Fassets%2Fimages%2Fonboarding-img2.png&w=1080&q=75"
          />
        </div>
      </div>

      <div className="seller-login-footer-art" />
    </div>
  );
}


