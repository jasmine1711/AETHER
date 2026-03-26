import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ProductCard from "../components/product/ProductCard";
import useInView from "../hooks/useInView";
import "./Products.css";
import api from "../utils/api";

const defaultImage = "/images/default.jpg";

// ✅ Category slug to display name mapping
const categoryMap = {
  "leather-jackets": "Leather Jackets",
  "y2k-tops": "Y2K Tops",
  "corset-tops": "Corset Tops",
  "denim-jeans": "Denim Jeans",
  "handbags": "Handbags",
  "faux-leather": "Faux Leather",
  "faux-leather-jackets": "Faux Leather"
};

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
    let isMounted = true;
    
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const categorySlug = searchParams.get("category") || "";
        
        // ✅ Convert category slug to the format backend expects
        let categoryParam = "";
        if (categorySlug && categoryMap[categorySlug]) {
          categoryParam = categoryMap[categorySlug];
          console.log(`🔄 Converting category: ${categorySlug} → ${categoryParam}`);
        } else if (categorySlug) {
          // If no mapping found, try to format it (e.g., "faux-leather" → "Faux Leather")
          categoryParam = categorySlug
            .split("-")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
          console.log(`🔄 Formatted category: ${categorySlug} → ${categoryParam}`);
        }
        
        // Build URL - use category display name, not slug
        let url = "/api/products?limit=100";
        if (categoryParam) {
          url = `/api/products?category=${encodeURIComponent(categoryParam)}&limit=100`;
        }
        
        console.log(`📡 Fetching: ${url}`);
        const response = await api.get(url);
        
        if (!isMounted) return;
        
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
      isMounted = false;
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
        <p>No products found in this category.</p>
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