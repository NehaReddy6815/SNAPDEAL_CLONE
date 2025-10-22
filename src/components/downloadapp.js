import React, { useEffect } from "react";
import "./download-app.css";

const DownloadApp = () => {
  useEffect(() => {
    const banner = document.getElementById("downloadAppBanner");
    banner.classList.add("active");
  }, []);

  return (
    <section className="download-app-banner" id="downloadAppBanner">
      <div className="container">
        <div className="app-image">
          <img
            src="https://i2.sdlcdn.com/img/appScreenshot@1x.png"
            alt="Snapdeal App"
          />
        </div>
        <div className="app-text">
          <h2>Download Snapdeal App Now</h2>
          <p>Fast, Simple & Delightful.</p>
          <p>All it takes is 30 seconds to Download.</p>
          <div className="app-buttons">
            <a
              href="https://itunes.apple.com/in/app/snapdeal-online-shopping-india/id721124909?ls=1&mt=8&utm_source=mobileAppLp&utm_campaign=ios"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/67/App_Store_%28iOS%29.svg"
                alt="App Store"
              />
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.snapdeal.main&utm_source=mobileAppLp&utm_campaign=android"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                alt="Google Play"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DownloadApp;
