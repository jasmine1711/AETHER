import React, { useRef, useLayoutEffect } from 'react';
import ProductCard from './product/ProductCard';
// CORRECTED: The hook is named useCartWishlist, not useCart
import { useCartWishlist } from '../context/CartWishlistContext'; 
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ProductGrid.css';

gsap.registerPlugin(ScrollTrigger);

const products = [
  // ... your products array remains the same
  {
    id: 1,
    name: "Vintage Leather Jacket",
    price: 8999,
    brand: "RetroRebels",
    category: "leather jacket",
    thumbnail: "/images/products/Patchwork Faux Leather Jacket/1.jpeg",
    badge: "Vintage",
    condition: "Vintage",
    description: "A timeless vintage patchwork leather jacket."
  },
  {
    id: 2,
    name: "Y2K Mesh Top",
    price: 3499,
    brand: "Y2KVibes",
    category: "y2k era tops",
    thumbnail: "/images/products/Red puff sleeve open back top/1red.jpeg",
    badge: "Y2K",
    condition: "New",
    description: "Sheer Y2K-inspired mesh top for a bold throwback vibe."
  },
  {
    id: 3,
    name: "Lace-Up Corset Top",
    price: 4299,
    brand: "AltFashion",
    category: "corset top",
    thumbnail: "/images/products/Cat Lover Corset Top/3.jpeg",
    badge: "Trending",
    condition: "New",
    description: "Elegant lace-up corset top for statement styling."
  },
  {
    id: 4,
    name: "Distressed Denim Jeans",
    price: 5999,
    brand: "DenimHeads",
    category: "denim jeans",
    thumbnail: "/images/products/Dark Blue Classic Denim/3.jpeg",
    condition: "Vintage",
    description: "Classic distressed denim jeans with retro fit."
  },
  {
    id: 5,
    name: "Designer Leather Handbag",
    price: 12999,
    brand: "LuxuryBags",
    category: "handbags",
    thumbnail: "/images/products/Coach-Tabby-Bag-Daisy-Print-90s-Trend.webp",
    badge: "Luxury",
    condition: "New",
    description: "Luxury designer handbag, premium quality and finish."
  },
  {
    id: 6,
    name: "Faux Leather Biker Jacket",
    price: 6599,
    brand: "VeganStyle",
    category: "faux leather jacket",
    thumbnail: "/images/products/Faux Leather Jacket/WhatsApp Image 2025-08-27 at 10.50.09.jpeg",
    badge: "Vegan",
    condition: "New",
    description: "Cruelty-free faux leather jacket with edge."
  }
];

export default function ProductGrid() {
  // CORRECTED: Call the correct hook to get the context functions
  const { addToCart } = useCartWishlist();
  const gridRef = useRef(null);
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from(gridRef.current.children, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.thumbnail,
      category: product.category,
    });
  };

  return (
    <section className="product-grid-section" ref={sectionRef}>
      <h2>Curated Collection</h2>
      <p className="collection-subtitle">Where 90s nostalgia meets contemporary style</p>
      <div className="product-grid" ref={gridRef}>
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={() => handleAddToCart(product)}
          />
        ))}
      </div>
    </section>
  );
}