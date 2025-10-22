import "./footer.css"
import "@fortawesome/fontawesome-free/css/all.min.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div>
        <i className="paymentIcon footerIconsImg"></i>
          <h5 className="h5">100% SECURE PAYMENTS</h5>
          <p>Moving your card details to a much more secured place</p>
        </div>
        <div>
        <i class="trustpayIcon footerIconsImg"></i>
          <h5 className="h5">TRUSTPAY</h5>
          <p>100% Payment Protection. Easy Return Policy</p>
        </div>
        <div>
        <i class="customerCareIcon footerIconsImg"></i>
          <h5 className="h5">HELP CENTER</h5>
          <p>Got a question? Look no further.</p>
        </div>
        <div>
        <i class="shoponGoIcon footerIconsImg"></i>
          <h5 className="h5" >SHOP ON THE GO</h5>

          <p>Download the app and get exciting offers</p>
        </div>
      </div>

      <div className="footer-links">
        <div>
          <h6>POLICY INFO</h6>
          <ul>
            <li>Privacy Policy</li>
            <li>Terms of Sale</li>
            <li>Terms of Use</li>
            <li>Report Abuse & Takedown Policy</li>
            <li>Certification</li>
          </ul>
        </div>
        <div>
          <h6>COMPANY</h6>
          <ul>
            <li>About Us</li>
            <li>Careers</li>
            <li>Blog</li>
            <li>Contact Us</li>
          </ul>
        </div>
        <div>
          <h6>SNAPDEAL BUSINESS</h6>
          <ul>
            <li>Shopping App</li>
            <li>Sell on Snapdeal</li>
          </ul>
        </div>
        <div>
          <h6>POPULAR LINKS</h6>
          <ul>
            <li>Lehenga</li>
            <li>Sarees</li>
            <li>Winter Wear</li>
          </ul>
        </div>
        <div>
          <h6>SUBSCRIBE</h6>
          <input type="email" placeholder="Your email address" />
          <button>SUBSCRIBE</button>
        </div>
      </div>

      <div className="footer-bottom">
        <p>PAYMENT OPTIONS</p>
        <p>CONNECT WITH US</p>
      </div>
       <div className="footer-categories">
        <p><b>Men:</b> Shirts for Men / Casual Shirts for Men / Formal Shirts for Men / Hoodies for Men / Cotton Shirts for Men / T Shirts for Men / Polo T shirts / Kurta Pajama for Men / White Shirt / Black Shirt / Lower for Men / Trousers for Men / Jacket for Men / Formal Pants for Men /
         Tracksuit for Men / Jeans for Men / Kurta Payjama Sets / Kurta for Men / Blazer for Men / Sweater for Men</p>
        <p><b>Women:</b> Tops for Women / Kurti / Cotton Sarees / Georgette Sarees / Chiffon Sarees / Net Sarees / Dresses for Women / Jumpsuit for Women / Jeans for Women / Salwar Suit / Bra / Jacket for Women / Night Dress for Women / Sweatshirt for Women / Shorts for Women / Readymade Blouse / Dupatta / T Shirt for Women / Shirts for Women / Skirts for Women / Ethnic wear for Women / Western Dresses for Women / Leggings for Women
</p>
        <p><b>Footwear:</b>  Men's Footwear / Casual Shoes for Men / Formal Shoes for Men / Loafers for Men / Slippers for Men / Boots for Men / Sandals for Men / Footwear for Women / Heels for Women / Sandals for Women / Shoes for Women / Sandals for Women / Slippers for Women / Boots for Women / Jutti for Women / Sports Shoes for Women</p>
        <p><b>Home & Kitchen:</b> Wall Painting / Wall Stickers / Dream Catcher / Rangoli Designs / Clock / Wall Clock / Alarm Clock / Diya / Wall Hanging / Ceiling Lights / Table Lamp / Hanging Lights / LED Bulbs / Torch Light / Flower Vase / Keychain / Rudraksha / Screwdriver</p>
        <p><b>Watch:</b> Watch For Men / Womens Watches / Smart Watch / Boys Watch / Girls Watch</p>
        <p><b>Home Furnishing:</b> Bed Sheet / Mosquito Net / Mattress / Curtains / Sofa Cover / Blanket / Pillow / Carpet / Apron / Quilt / Floor Mat / Towel / Pillow Cover</p>
        <p><b>Electronics:</b>  Bluetooth Speakers / Headphones / Earphone / Ceiling Fan / Geysers / Trimmer / Hair Straightner / Hair Dryer / Water Purifier / Mixer Grinder / Gas Stove / Electric Kettle / Computer Mouse / Computer Keyboard / USB & HDMI Cables / Computer Antivirus</p>
        <p><b>Mobile Accessories:</b> Mobile Covers / Leather Mobile Covers / Printed Back Covers / Tempered Glass</p>
      </div>
      <div className="footer-about">
        <p>
          Snapdeal is India's leading pure-play value Ecommerce platform.
          Founded in 2010 by Kunal Bahl and Rohit Bansal, Snapdeal is one of the top four
          online lifestyle shopping destinations of India. Snapdeal brings together a
          wide assortment of good quality and value- priced merchandise on its platform.
          Snapdeal's vision is to enable the shoppers of Bharat to experience the joy of living their aspirations
          through reliable, value-for-money shopping. With a personalized, multilingual interface and cutting edge technology,
          Snapdeal has simplified the shopping experience for its value-conscious buyers by showcasing the most relevant products- products that are a good
          functional fit with their needs and of a quality that lasts- thereby delivering true value to its customers. With its commitment
          to high service standards, Snapdeal suppliers operate under a well structured ecosystem that enables them to offer great
          quality products at affordable prices. With majority of the value-seeking, middle-income, price-conscious buyers coming
          from the non-metros, Snapdeal’s logistics networks powered by third party logistics cover more than 96% of India’s pin
          codes enabling order deliveries to more than 2500 towns and cities and expanding. Further, Snapdeal's mission is
          to become India’s value lifestyle omni-channel leader. We are excited about continuing to build a complete ecosystem
          around value commerce, where we can serve Bharat consumers wherever they are on their offline to online shopping journey.
          Snapdeal is part of the AceVector Group and one of India’s best-known e-commerce
          companies with an exclusive focus on the value segment.

        </p>
      </div>
    </footer>
  );
};

export default Footer;
