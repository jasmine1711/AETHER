import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ProductCard from "../components/product/ProductCard";
import useInView from "../hooks/useInView";
import "./Products.css";

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
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const categoryParam = searchParams.get("category") || "";

    // Full product list
    const allProductsList = [
      {
        name: "Belted Faux Leather Long Coat",
        slug: "belted-faux-leather-long-coat",
        category: "Faux Leather",
        price: 5199,
        sizes: ["S", "M", "L"],
        thumbnail: "/images/products/belted-faux-leather-long-coat/1.jpeg",
        images: [
          "/images/products/belted-faux-leather-long-coat/1.jpeg",
          "/images/products/belted-faux-leather-long-coat/2.jpeg",
          "/images/products/belted-faux-leather-long-coat/3.jpeg",
        ],
      },
      {
        name: "Black Polka Net Top",
        slug: "black-polka-net-top",
        category: "Y2K Tops",
        price: 1999,
        sizes: ["S", "M", "L"],
        thumbnail: "/images/products/black-polka-net-top/1.jpeg",
        images: [
          "/images/products/black-polka-net-top/1.jpeg",
          "/images/products/black-polka-net-top/2.jpeg",
          "/images/products/black-polka-net-top/3.jpeg",
        ],
      },
      {
        name: "Blue Jean Corset",
        slug: "blue-jean-corset",
        category: "Corset Tops",
        price: 1099,
        sizes: ["S", "M", "L"],
        thumbnail: "/images/products/blue-jean-corset/1.jpeg",
        images: [
          "/images/products/blue-jean-corset/1.jpeg",
          "/images/products/blue-jean-corset/2.jpeg",
        ],
      },
      {
        name: "Burgundy Halter Neck Corset Top",
        slug: "burgundy-halter-neck-corset-top",
        category: "Corset Tops",
        price: 1599,
        sizes: ["S", "M", "L"],
        thumbnail: "/images/products/burgundy-halter-neck-corset-top/2.jpeg",
        images: [
          "/images/products/burgundy-halter-neck-corset-top/1.jpeg",
          "/images/products/burgundy-halter-neck-corset-top/2.jpeg",
          "/images/products/burgundy-halter-neck-corset-top/3.jpeg",
        ],
      },
      {
        name: "Cat Lover Corset Top",
        slug: "cat-lover-corset-top",
        category: "Corset Tops",
        price: 1899,
        sizes: ["S", "M", "L"],
        thumbnail: "/images/products/cat-lover-corset-top/3.jpeg",
        images: [
          "/images/products/cat-lover-corset-top/1.jpeg",
          "/images/products/cat-lover-corset-top/2.jpeg",
          "/images/products/cat-lover-corset-top/3.jpeg",
        ],
      },
      {
        name: "Dark Blue Classic Denim",
        slug: "dark-blue-classic-denim",
        category: "Denim Jeans",
        price: 2299,
        sizes: ["S", "M", "L"],
        thumbnail: "/images/products/dark-blue-classic-denim/2.jpeg",
        images: [
          "/images/products/dark-blue-classic-denim/1.jpeg",
          "/images/products/dark-blue-classic-denim/2.jpeg",
          "/images/products/dark-blue-classic-denim/3.jpeg",
        ],
      },
      {
        name: "Embroidery Vintage Denim",
        slug: "embroidery-vintage-denim",
        category: "Denim Jeans",
        price: 2699,
        sizes: ["S", "M", "L"],
        thumbnail: "/images/products/embroidery-vintage-denim/1.jpeg",
        images: [
          "/images/products/embroidery-vintage-denim/1.jpeg",
          "/images/products/embroidery-vintage-denim/2.jpeg",
          "/images/products/embroidery-vintage-denim/3.jpeg",
        ],
      },
      {
        name: "Faux Leather Jacket",
        slug: "faux-leather-jacket",
        category: "Faux Leather",
        price: 3499,
        sizes: ["S", "M", "L"],
        thumbnail: "/images/products/faux-leather-jacket/1.jpeg",
        images: [
          "/images/products/faux-leather-jacket/1.jpeg",
          "/images/products/faux-leather-jacket/2.jpeg",
          "/images/products/faux-leather-jacket/5.jpeg",
          "/images/products/faux-leather-jacket/4.jpeg"
        ],
      },
      {
        name: "French Lantern Sleeves Corset Top",
        slug: "french-lantern-sleeves-corset-top",
        category: "Corset Tops",
        price: 1990,
        sizes: ["S", "M", "L"],
        thumbnail: "/images/products/french-lantern-sleeves-corset-top/1.jpeg",
        images: [
          "/images/products/french-lantern-sleeves-corset-top/1.jpeg",
          "/images/products/french-lantern-sleeves-corset-top/2.jpeg",
        ],
      },
      {
        name: "Gen Z Touch Denim",
        slug: "gen-z-touch-denim",
        category: "Denim Jeans",
        price: 2099,
        sizes: ["S", "M", "L"],
        thumbnail: "/images/products/gen-z-touch-denim/1.jpeg",
        images: [
          "/images/products/gen-z-touch-denim/1.jpeg",
          "/images/products/gen-z-touch-denim/2.jpeg",
        ],
      },
      {
        name: "Heart Shape Bell Bottom",
        slug: "heart-shape-bell-bottom",
        category: "Denim Jeans",
        price: 2499,
        sizes: ["S", "M", "L"],
        thumbnail: "/images/products/heart-shape-bell-bottom/2.jpeg",
        images: [
          "/images/products/heart-shape-bell-bottom/1.jpeg",
          "/images/products/heart-shape-bell-bottom/2.jpeg",
          "/images/products/heart-shape-bell-bottom/3.jpeg",
        ],
      },
      {
        name: "Heartshape Leather Purse",
        slug: "heartshape-leather-purse",
        category: "Handbags",
        price: 3199,
        sizes: ["One Size"],
        thumbnail: "/images/products/heartshape-leather-purse/purse1.jpg",
        images: [
          "/images/products/heartshape-leather-purse/purse1.jpg",
          "/images/products/heartshape-leather-purse/purse2.jpg",
        ],
      },
      {
        name: "Patchwork Faux Leather Jacket",
        slug: "patchwork-faux-leather-jacket",
        category: "Leather Jackets",
        price: 2999,
        sizes: ["S", "M", "L"],
        thumbnail: "/images/products/patchwork-faux-leather-jacket/1.jpeg",
        images: [
          "/images/products/patchwork-faux-leather-jacket/1.jpeg",
          "/images/products/patchwork-faux-leather-jacket/2.jpeg",
          "/images/products/patchwork-faux-leather-jacket/3.jpeg",
        ],
      },
      {
        name: "Puff Full Sleeves Top",
        slug: "puff-full-sleeves-top",
        category: "Y2K Tops",
        price: 2099,
        sizes: ["S", "M", "L"],
        thumbnail: "/images/products/puff-full-sleeves-top/1boe.jpeg",
        images: [
          "/images/products/puff-full-sleeves-top/1boe.jpeg",
          "/images/products/puff-full-sleeves-top/2boe.jpeg",
          "/images/products/puff-full-sleeves-top/3boe.jpeg",
        ],
      },
      {
        name: "Red Puff Sleeve Open Back Top",
        slug: "red-puff-sleeve-open-back-top",
        category: "Y2K Tops",
        price: 1499,
        sizes: ["S", "M", "L"],
        thumbnail: "/images/products/red-puff-sleeve-open-back-top/1red.jpeg",
        images: [
          "/images/products/red-puff-sleeve-open-back-top/1red.jpeg",
          "/images/products/red-puff-sleeve-open-back-top/2red.jpeg",
          "/images/products/red-puff-sleeve-open-back-top/3red.jpeg",
        ],
      },
      {
        name: "Ruffled Blouse With Bow Clouser",
        slug: "ruffled-blouse-with-bow-clouser",
        category: "Y2K Tops",
        price: 2299,
        sizes: ["S", "M", "L"],
        thumbnail: "/images/products/ruffled-blouse-with-bow-clouser/1white.jpeg",
        images: [
          "/images/products/ruffled-blouse-with-bow-clouser/1white.jpeg",
          "/images/products/ruffled-blouse-with-bow-clouser/2white.jpeg",
          "/images/products/ruffled-blouse-with-bow-clouser/3white.jpeg",
        ],
      },
      {
        name: "White Handbag",
        slug: "white-handbag",
        category: "Handbags",
        price: 4299,
        sizes: ["One Size"],
        thumbnail: "/images/products/white-handbag/handbag2.jpg",
        images: [
          "/images/products/white-handbag/handbag2.jpg",
          "/images/products/white-handbag/handbag3.webp",
          "/images/products/white-handbag/handbag4.webp",
        ],
      },
      {
        name: "White Polka Top",
        slug: "white-polka-top",
        category: "Y2K Tops",
        price: 2099,
        sizes: ["S", "M", "L"],
        thumbnail: "/images/products/white-polka-top/1.jpeg",
        images: [
          "/images/products/white-polka-top/1.jpeg",
          "/images/products/white-polka-top/2.jpeg",
          "/images/products/white-polka-top/3.jpeg",
        ],
      },
      {
        name: "Coach Tabby Bag Daisy Print 90s",
        slug: "coach-tabby-bag-daisy-print-90s",
        category: "Handbags",
        price: 3499,
        sizes: ["One Size"],
        thumbnail: "/images/products/coach-tabby-bag-daisy-print-90s-trend.webp",
        images: [
          "/images/products/coach-tabby-bag-daisy-print-90s-trend.webp",
        ],
      },
      {
        name: "Messanger Bag",
        slug: "messanger-bag",
        category: "Handbags",
        price: 1999,
        sizes: ["One Size"],
        thumbnail: "/images/products/messanger-bag.avif",
        images: ["/images/products/messanger-bag.avif"],
      },
    ];

    // Ensure fallback for each product
   const productsWithFallback = allProductsList.map((p) => ({
      ...p,
      _id: p.slug,
      thumbnail: p.thumbnail || p.images?.[0] || defaultImage,
      images: p.images?.length ? p.images : [defaultImage],
    }));

    // Filter by category
    const filtered = categoryParam
      ? productsWithFallback.filter(
          (p) => slugify(p.category) === slugify(categoryParam)
        )
      : productsWithFallback;

    setAllProducts(filtered);
  }, [searchParams]);

  if (!allProducts.length)
    return <div className="products-loading">No products found.</div>;

  return (
    <div className="products-page">
      <div className="container">
        <div className="products-grid">
          {allProducts.map((product) => (
            <AnimatedProductCard key={product.slug} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}