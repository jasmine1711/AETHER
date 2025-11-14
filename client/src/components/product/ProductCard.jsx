import React, { useState, useEffect, useRef, forwardRef } from "react";
import { useCartWishlist } from "../../context/CartWishlistContext";
import { FaHeart } from "react-icons/fa";
import "./ProductCard.css";
import { animateImageToCart } from "../../utils/animateToCart";

// ✅ Helper: choose best media (thumbnail, image, or fallback)
const getBestMedia = (product, fallback = "/images/default.jpg") =>
  product?.thumbnail || product?.images?.[0] || fallback;

// ✅ Helper: check if URL is a video
const isVideo = (url) => /\.(mp4|avi|webm)$/i.test(url);

const ProductCard = forwardRef(({ product }, ref) => {
  const { addToCart, isInWishlist, addToWishlist, removeFromWishlist } =
    useCartWishlist();

  // ✅ Hooks
  const [wishlisted, setWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);

  // ✅ Always call useRef once
  const localRef = useRef(null);
  const imgRef = ref ?? localRef;

  // ✅ Derived values
  const pid = product?.slug || product?.id || product?._id;
  const mediaUrl = getBestMedia(product);
  const priceNumber = Number(product?.price ?? 0);
  const formattedPrice = isNaN(priceNumber)
    ? product?.price || "N/A"
    : priceNumber.toLocaleString("en-IN");

  // ✅ Sync wishlist state
  useEffect(() => {
    setWishlisted(isInWishlist(pid));
  }, [isInWishlist, pid]);

 // ✅ Add to Cart
  const handleAddToCart = (e) => {
    e.preventDefault();
    if (addingToCart) return;
    setAddingToCart(true);

    // ✅ FIXED: Send only the database ID, not the whole object or slug
    addToCart(product);

    try {
      animateImageToCart(imgRef.current, ".icon-cart");
    } catch (err) {
      console.warn("Cart animation failed:", err);
    }

    setTimeout(() => setAddingToCart(false), 600);
  };
  
  // ✅ Wishlist toggle
  const toggleWishlist = (e) => {
    e.preventDefault();
    if (togglingWishlist) return;
    setTogglingWishlist(true);

    try {
      if (!wishlisted) {
        addToWishlist(product);
        setWishlisted(true);
      } else {
        removeFromWishlist(pid);
        setWishlisted(false);
      }
    } catch (err) {
      console.error("Wishlist toggle error:", err);
    } finally {
      setTogglingWishlist(false);
    }
  };

  // ✅ Fallback image handler
  const handleImageError = (e) => {
    if (e.currentTarget.src !== "/images/default.jpg") {
      e.currentTarget.src = "/images/default.jpg";
    }
  };

  return (
    <div className="product-card" aria-live="polite">
      <div className="product-image-container">
        {isVideo(mediaUrl) ? (
          <video
            ref={imgRef}
            src={mediaUrl}
            className="product-image"
            controls
          />
        ) : (
          <img
            ref={imgRef}
            src={mediaUrl}
            alt={product?.name || "Product"}
            className="product-image"
            onError={handleImageError}
            loading="lazy"
          />
        )}

        {product?.badge && (
          <span
            className={`product-badge ${
              product.badge === "New" ? "badge-new" : "badge-sale"
            }`}
          >
            {product.badge}
          </span>
        )}

        <button
          onClick={toggleWishlist}
          className={`product-heart ${wishlisted ? "wishlisted" : ""}`}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wishlisted}
          disabled={togglingWishlist}
        >
          <FaHeart />
        </button>
      </div>

      <div className="product-content">
        <h3 className="product-title">{product?.name || "Untitled Product"}</h3>
        <p className="product-brand">
          {product?.brand ? `${product.brand} | ` : ""}
          {product?.category || "Uncategorized"}
        </p>
        <p className="product-price">
          ₹{formattedPrice || "Contact for price"}
        </p>

        <div className="product-actions">
          <button
            onClick={handleAddToCart}
            className="add-to-cart-btn"
            disabled={addingToCart}
            aria-busy={addingToCart}
          >
            {addingToCart ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
});

export default ProductCard;
