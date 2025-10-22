import { useState ,useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Navbar from './components/Navbar';
import HomePage from './Pages/Homepage';
import { Routes, Route, BrowserRouter, useLocation } from "react-router-dom";
import ProductDetail from './components/ProductDetail';
import CartPage from './Pages/CartPage';
import ViewCart from './Pages/ViewCart';
import CheckoutPage from "./Pages/CheckoutPage";
import CategoryPage from './components/categoryPage';

import VendorDashboard from "./Pages/VendorDashboard";
import AdminRoute from "./components/adminRoute";

import SellOnSnapdeal from "./Pages/SellOnSnapdeal";
import SellerLogin from "./Pages/SellerLogin";
import { setUser } from './redux/userSlice';
import LoginForm from './components/Loginform';
import OrdersPage from './Pages/OrdersPage';
import SearchResults from './components/SearchResults';
import "./App.css";

function App() {
  const dispatch = useDispatch();
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      dispatch(setUser(JSON.parse(savedUser)));
    }
    setLoading(false);
  }, [dispatch]);

  if (loading) return null; 
  const RoutesWithNavbar = () => {
    const location = useLocation();
    const hideNav = (location.pathname === '/sell-on-snapdeal') || (location.pathname === '/seller-login') || location.pathname.startsWith('/vendor');
    return (
      <>
        {!hideNav && <Navbar />}
         
        <Routes>
          
          <Route path="/" element={<HomePage />} />
          <Route path='/product/:id' element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/view-cart" element={<ViewCart />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/vendor/dashboard" element={<AdminRoute><VendorDashboard /></AdminRoute>} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/products" element={< CategoryPage />} />

          <Route path="/sell-on-snapdeal" element={<SellOnSnapdeal />} />
          <Route path="/seller-login" element={<SellerLogin />} />
        </Routes>
      </>
    );
  };

  return (
    <div>
      <BrowserRouter>
        <RoutesWithNavbar />
      </BrowserRouter>
    </div>
  );
}

export default App;
