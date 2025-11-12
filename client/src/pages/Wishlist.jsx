// src/pages/Wishlist.jsx
import React, { useState } from "react";
import { useCartWishlist } from "../context/CartWishlistContext";
import { Link } from "react-router-dom";
import "./Wishlist.css";

export default function Wishlist() {
  const { wishlist, removeFromWishlist, addToCart } = useCartWishlist();
  const [loading, setLoading] = useState(false);

  const moveToCart = async (item) => {
    setLoading(true);
    try {
      // ✅ FIX: Pass the entire item object. Our context's addToCart
      // function needs the `_id` field, which was missing before.
      await addToCart(item);

      // ✅ FIX: Pass the actual product _id for removal
      removeFromWishlist(item._id);

      alert(`${item.name} moved to Cart!`);
    } catch (err) {
      console.error("Error moving to cart:", err);
      alert("Failed to move item to cart");
    } finally {
      setLoading(false);
    }
  };

  if (!wishlist) return <p className="loading">Loading wishlist...</p>;

  return (
    <div className="wishlist-page">
      <div className="container">
        <h1 className="wishlist-title">Your Wishlist</h1>

        {wishlist.length === 0 ? (
          <p className="empty-msg">
            No items in wishlist. <Link to="/products">Start shopping!</Link>
          </p>
        ) : (
          <ul className="wishlist-list">
            {wishlist.map((item) => (
              // ✅ FIX: Use item._id for the key as it's the true unique ID
              <li key={item._id} className="wishlist-item">
                <img
                  src={item.thumbnail || "/images/default.jpg"}
                  alt={item.name}
                  className="wishlist-img"
                  onError={(e) => (e.currentTarget.src = "/images/default.jpg")}
                />
                <div className="wishlist-details">
                  <h2>{item.name}</h2>
                  <p>₹{Number(item.price).toLocaleString("en-IN")}</p>
                  <div className="wishlist-btns">
                    <button
                      className="remove-btn"
                      // ✅ FIX: Pass the actual product _id for removal
                      onClick={() => removeFromWishlist(item._id)}
                    >
                      Remove
                    </button>
                    <button
                      className="cart-btn"
                      onClick={() => moveToCart(item)}
                      disabled={loading}
                    >
                      {loading ? "Moving..." : "Move to Cart"}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}