// src/pages/ProductDetail.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useCartWishlist } from "../context/CartWishlistContext";
import ProductCard from "../components/product/ProductCard";
import { FaHeart } from "react-icons/fa";
import "./ProductDetail.css";
import { animateImageToCart } from "../utils/animateToCart";

const fallbackImage = "/images/default.jpg"; // ✅ use from public folder

export default function ProductDetail() {
  const { id: slug } = useParams();
  const { addToCart, isInWishlist, addToWishlist, removeFromWishlist } =
    useCartWishlist();

  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [showSizeAlert, setShowSizeAlert] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [mainMedia, setMainMedia] = useState(fallbackImage);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [wishlisted, setWishlisted] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);
  const imgRef = useRef(null);

  const isVideo = (url) => /\.(mp4|avi|webm)$/i.test(url);

  useEffect(() => {
    async function fetchProduct() {
      try {
const res = await fetch(`/api/products/slug/${slug}`);
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();

        setProduct(data);
        setSelectedSize(data.sizes?.[0] || "");
        setMainMedia(data.images?.[0] || data.thumbnail || fallbackImage);
        setWishlisted(isInWishlist(data._id));

        // Fetch related products
        if (data.category) {
          const relRes = await fetch(
            `/api/products?category=${encodeURIComponent(data.category)}`
          );
          const relJson = await relRes.json();
          const relProducts = relJson.products || relJson;
      setRelatedProducts(
  relProducts.filter((p) => p._id !== data._id && p.slug)
);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      }
    }
    fetchProduct();
  }, [slug, isInWishlist]);

  if (!product)
    return (
      <div className="product-detail-loading">
        <p>Loading product...</p>
        <Link to="/products" className="btn-add-to-cart">
          Back to Products
        </Link>
      </div>
    );

  const handleAddToCart = () => {
    if (!selectedSize) {
      setShowSizeAlert(true);
      return;
    }

    const cartItem = {
      _id: product._id,
      name: product.name,
      price: Number(product.price) || 0,
      thumbnail: mainMedia || fallbackImage,
      category: product.category || "Uncategorized",
      size: selectedSize,
      quantity: quantity || 1,
    };

    addToCart(cartItem);

    try {
      animateImageToCart(imgRef.current, ".icon-cart");
    } catch {}
  };

  const toggleWishlist = async () => {
    if (togglingWishlist) return;
    setTogglingWishlist(true);

    try {
      if (!wishlisted) {
        await addToWishlist({
          _id: product._id, 
          name: product.name,
          thumbnail: mainMedia || fallbackImage,
          price: Number(product.price) || 0,
          category: product.category || "Uncategorized",
          size: selectedSize || "",
          quantity: quantity || 1,
        });
        setWishlisted(true);
        try {
          animateImageToCart(imgRef.current, ".icon-wishlist");
        } catch {}
      } else {
        await removeFromWishlist(product._id);
        setWishlisted(false);
      }
    } catch (err) {
      console.error("Wishlist toggle failed:", err);
    } finally {
      setTogglingWishlist(false);
    }
  };

  const images =
    product.images?.length > 0
      ? product.images
      : [product.thumbnail || fallbackImage];
  const additionalImages = images.filter((img) => img !== mainMedia);

  return (
    <div className="product-detail">
      <div className="container">
        <nav className="breadcrumb">
          <Link to="/">Home</Link> / <Link to="/products">Products</Link> /{" "}
          <Link to={`/products?category=${product.category}`}>
            {product.category}
          </Link>{" "}
          / <span>{product.name}</span>
        </nav>

        <div className="product-detail-content">
          {/* --- Product Gallery --- */}
          <div className="product-gallery">
            <div className="main-media zoom-container">
              {isVideo(mainMedia) ? (
                <video src={mainMedia} controls ref={imgRef} />
              ) : (
                <img
                  ref={imgRef}
                  src={mainMedia || fallbackImage}
                  alt={product.name}
                  onError={(e) => (e.currentTarget.src = fallbackImage)}
                />
              )}
            </div>

            {images.length > 1 && (
              <div className="image-thumbnails">
                {images.map((media, idx) =>
                  isVideo(media) ? (
                    <video
                      key={idx}
                      src={media}
                      controls
                      className={
                        mainMedia === media ? "selected-thumbnail" : ""
                      }
                      onClick={() => setMainMedia(media)}
                    />
                  ) : (
                    <img
                      key={idx}
                      src={media || fallbackImage}
                      alt={`${product.name} view ${idx + 1}`}
                      onClick={() => setMainMedia(media)}
                      className={
                        mainMedia === media ? "selected-thumbnail" : ""
                      }
                      onError={(e) => (e.currentTarget.src = fallbackImage)}
                    />
                  )
                )}
              </div>
            )}
          </div>

          {/* --- Product Info --- */}
          <div className="product-info">
            <h1>{product.name}</h1>
            <p>{product.category}</p>
            <p className="product-price">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </p>

            {product.sizes?.length > 0 && (
              <div className="size-selection">
                <h3>Select Size</h3>
                <div className="size-options">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      className={`size-btn ${
                        selectedSize === size ? "selected" : ""
                      }`}
                      onClick={() => {
                        setSelectedSize(size);
                        setShowSizeAlert(false);
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {showSizeAlert && (
                  <p className="size-alert active">
                    ⚠ Please select a size before adding to cart.
                  </p>
                )}
              </div>
            )}

            <div className="quantity-selection">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                -
              </button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)}>+</button>
            </div>

            <div className="action-buttons">
              <button onClick={handleAddToCart} className="btn-add-to-cart">
                Add to Cart
              </button>
              <button
                onClick={toggleWishlist}
                className={`btn-wishlist ${wishlisted ? "wishlisted" : ""}`}
                disabled={togglingWishlist}
              >
                <FaHeart color={wishlisted ? "#cf1020" : "#bbb"} />{" "}
                {wishlisted ? "Wishlisted" : "Add to Wishlist"}
              </button>
            </div>

            {additionalImages.length > 0 && (
              <div className="additional-images-section">
                <h4>Other Views</h4>
                <div className="additional-images-grid">
                  {additionalImages.map((image, index) => (
                    <div key={index} className="grid-image-item">
                      {isVideo(image) ? (
                        <video src={image} controls />
                      ) : (
                        <img
                          src={image || fallbackImage}
                          alt={`${product.name} view ${index + 2}`}
                          onError={(e) => (e.currentTarget.src = fallbackImage)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- Related Products --- */}
        {relatedProducts.length > 0 && (
          <section className="product-features">
            <h3>Related Products</h3>
            <div className="products-grid">
              {relatedProducts.map((p) => {
                const thumb = p.thumbnail || p.images?.[0] || fallbackImage;
                return (
                  <Link
                    key={p._id}
                    to={`/product/${p.slug}`}
                    className="product-link"
                  >
                    <ProductCard product={{ ...p, thumbnail: thumb }} />
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
