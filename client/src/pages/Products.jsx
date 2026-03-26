import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ProductCard from "../components/product/ProductCard";
import useInView from "../hooks/useInView";
import "./Products.css";
import api from "../utils/api";

const defaultImage = "/images/default.jpg";

// Convert text to slug
const slugify = (text = "") => text.toLowerCase().trim().replace(/\s+/g, "-");

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
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const categoryParam = searchParams.get("category") || "";
    
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // ✅ Fetch from backend API
        const url = categoryParam 
          ? `/api/products?category=${encodeURIComponent(categoryParam)}`
          : "/api/products";
        
        const { data } = await api.get(url);

        // Handle different response structures
        const productsList = data.products || data;
        
        // Ensure each product has required fields
        const productsWithFallback = productsList.map((p) => ({
          ...p,
          _id: p._id || p.id,
          thumbnail: p.thumbnail || p.images?.[0] || defaultImage,
          images: p.images?.length ? p.images : [defaultImage],
        }));
        
        setAllProducts(productsWithFallback);
      } catch (error) {
        console.error("Error fetching products:", error);
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="products-loading">
        <div className="spinner"></div>
        <p>Loading products...</p>
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