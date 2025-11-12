import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCartWishlist } from "../../context/CartWishlistContext"; 
import { usePayment } from "../../context/PaymentContext";
import { FaShoppingCart, FaHeart } from "react-icons/fa";

import "./Navbar.css";


const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const { cart, wishlist } = useCartWishlist(); // ✅ updated
  const { paymentStatus } = usePayment();

  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 0)), 0); // ✅ computed total
  const wishlistCount = wishlist.length || 0;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">ÆTHER</Link>

        <ul className="navbar-links">
          <li><Link to="/products">Products</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/contact">Contact</Link></li>
          <li><Link to="/wardrobe">My Wardrobe</Link></li>
        </ul>

        <div className="navbar-right">
          {paymentStatus && (
            <span className={`payment-status ${paymentStatus.toLowerCase()}`}>
              {paymentStatus}
            </span>
          )}

          <div className="nav-icons">
            <Link to="/wishlist" className="icon-btn icon-wishlist">
              <FaHeart />
              {wishlistCount > 0 && <span className="icon-badge">{wishlistCount}</span>}
            </Link>

            <Link to="/cart" className="icon-btn icon-cart" title={`Total: ₹${total.toLocaleString("en-IN")}`}>
              <FaShoppingCart />
              {totalItems > 0 && <span className="icon-badge">{totalItems}</span>}
            </Link>
          </div>

          {currentUser ? (
            <>
              <span className="navbar-user">Hello, {currentUser.name || "User"}</span>
              <button className="navbar-btn" onClick={logout}>Logout</button>
            </>
          ) : (
            <Link to="/login" className="navbar-btn">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
