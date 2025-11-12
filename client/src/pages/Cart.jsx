// src/pages/Cart.jsx
import React from "react";
import { useCartWishlist } from "../context/CartWishlistContext";
import { useNavigate, Link } from "react-router-dom";
import "./Cart.css";

export default function Cart() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    subtotal,
    total,
    shipping,
    tax,
    totalItems,
    isEmpty,
  } = useCartWishlist();

  const navigate = useNavigate();

  const checkoutHandler = () => navigate("/checkout");
  

  if (!cart) return <p className="loading">Loading your cart...</p>;

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="cart-title">Your Cart</h1>

        {isEmpty ? (
          <p className="empty-msg">
            Your cart is empty. <Link to="/products">Start shopping!</Link>
          </p>
        ) : (
          <>
            <ul className="cart-list">
              {cart.map((item) => (
                // ✅ FIX: Use item.cartItemId for the key for guaranteed uniqueness
                <li key={item.cartItemId} className="cart-item">
                  <img
                    src={item.thumbnail || "/images/default.jpg"}
                    alt={item.name}
                    className="cart-img"
                    onError={(e) => (e.currentTarget.src = "/images/default.jpg")}
                  />
                  <div className="cart-details">
                    <h2>{item.name}</h2>
                    <p>
                      ₹{Number(item?.price || 0).toLocaleString("en-IN")}
                    </p>
                    <div className="quantity-control">
                      <button
                        onClick={() =>
                          // ✅ FIX: Pass item.cartItemId instead of item.id
                          updateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))
                        }
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          // ✅ FIX: Pass item.cartItemId instead of item.id
                          updateQuantity(item.cartItemId, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="remove-btn"
                      onClick={() =>
                        // ✅ FIX: Pass item.cartItemId instead of item.id
                        removeFromCart(item.cartItemId)
                      }
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Cart Summary */}
            <div className="cart-summary">
              <h2>Order Summary</h2>
              <p>
                Items ({totalItems}): ₹
                {Number(subtotal || 0).toLocaleString("en-IN")}
              </p>
              <p>
                Shipping: ₹{Number(shipping || 0).toLocaleString("en-IN")}
              </p>
              <p>
                Tax (18%): ₹{Number(tax || 0).toLocaleString("en-IN")}
              </p>
              <hr />
              <p className="cart-total">
                Total: ₹{Number(total || 0).toLocaleString("en-IN")}
              </p>
              <button className="checkout-btn" onClick={checkoutHandler}>
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}