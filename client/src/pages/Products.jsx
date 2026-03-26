import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ProductCard from "../components/product/ProductCard";
import useInView from "../hooks/useInView";
import "./Products.css";
import api from "../utils/api";

const defaultImage = "/images/default.jpg";

function AnimatedProductCard({ product }) {
  const [ref, isInView] = useInView();

  return (
    <Link
      to={`/product/${product.slug}`}
      className={`product-link fade-up ${isInView ? "visible" : ""}`}
      ref={ref}
    >
      <ProductCard product={product} />
    </Link>
  );
}

export default function Products() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    let isMounted = true; // ✅ Prevent state updates after unmount
    
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const categoryParam = searchParams.get("category") || "";
        let url = "/api/products?limit=100";
        if (categoryParam) {
          url = `/api/products?category=${encodeURIComponent(categoryParam)}&limit=100`;
        }
        
        const response = await api.get(url);
        
        if (!isMounted) return; // ✅ Don't update if component unmounted
        
        let productsList = [];
        
        if (response.data && Array.isArray(response.data)) {
          productsList = response.data;
        } else if (response.data && response.data.products && Array.isArray(response.data.products)) {
          productsList = response.data.products;
        } else if (Array.isArray(response.data)) {
          productsList = response.data;
        } else {
          console.error("Unexpected response structure:", response.data);
          productsList = [];
        }
        
        console.log(`✅ Fetched ${productsList.length} products for category: ${categoryParam || "all"}`);
        
        const productsWithFallback = productsList.map((p) => ({
          ...p,
          _id: p._id || p.id,
          slug: p.slug || p.name?.toLowerCase().replace(/\s+/g, '-'),
          thumbnail: p.thumbnail || p.images?.[0] || defaultImage,
          images: p.images?.length ? p.images : [defaultImage],
        }));
        
        setAllProducts(productsWithFallback);
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching products:", error);
          setError(error.message || "Failed to load products");
          setAllProducts([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();
    
    return () => {
      isMounted = false; // ✅ Cleanup
    };
  }, [searchParams]);

  if (loading) {
    return (
      <div className="products-loading">
        <div className="spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-loading">
        <p style={{ color: "red" }}>Error: {error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  if (!allProducts.length) {
    return (
      <div className="products-loading">
        <p>No products found.</p>
        <Link to="/products" className="btn-primary">View All Products</Link>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="container">
        <div className="products-grid">
          {allProducts.map((product) => (
            <AnimatedProductCard key={product.slug || product._id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}