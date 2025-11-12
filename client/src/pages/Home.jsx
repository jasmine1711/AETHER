import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Hero from "../components/layout/Hero";
import CategoryShowcase from "../components/layout/CategoryShowcase";
import Marquee from "../components/layout/Marquee";
import ProductGrid from "../components/product/ProductGrid"; 
import Testimonials from "../components/layout/Testimonials";
import Footer from "../components/layout/Footer"; 
import FeaturedCategory from "../components/layout/FeaturedCategory";
import "./Home.css";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const mainRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // --- Category Section Animations (No changes here) ---
const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".scroll-sequence-container",
          pin: true,
          scrub: 1,
          start: "top top",
          end: "+=3000",
        },
      });

       timeline
        .to(".hero .hero-content", { scale: 0.8, opacity: 0, duration: 1 })
        .to(".hero .hero-media-container", { scale: 0.9, y: "-10%", duration: 1 }, "<")
        .to(".showcase-background", { opacity: 1, duration: 1 }, "-=0.5")
        .from(".showcase-content", { opacity: 0, y: 100, duration: 1 }, "<")
        .to(".foreground-image-wrapper.img-1", { y: 0, duration: 1.2, ease: "power2.out" })
        .to(".foreground-image-wrapper.img-2", { y: 0, duration: 1.2, ease: "power2.out" }, "-=1");

      gsap.from(".section-title, .section-subtitle", {
        scrollTrigger: {
          trigger: ".categories-section",
          start: "top 85%",
          toggleActions: "play none none none",
        },
        opacity: 0,
        y: 50,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.2,
      });

      gsap.from(".category-card", {
        scrollTrigger: {
          trigger: ".categories-section",
          start: "top 75%",
        },
        opacity: 0,
        y: 100,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.1,
      });


      // --- UPDATED: Product Grid Section Animations ---
      // This now targets the h2 and subtitle *inside* your ProductGrid component
      gsap.from(".product-grid-section h2, .collection-subtitle", {
        scrollTrigger: {
          trigger: ".product-grid-section", // The trigger is the section from your ProductGrid.jsx
          start: "top 80%",
        },
        opacity: 0,
        y: 50,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.2
      });

      // This animation for the cards works perfectly with your new ProductCard component
      // because the root div still has the ".product-card" class. No changes needed.
      gsap.from(".product-card", {
        scrollTrigger: {
          trigger: ".product-grid-section",
          start: "top 70%",
        },
        opacity: 0,
        y: 100,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.1,
      });

       gsap.from(".testimonials-section .section-title", {
        scrollTrigger: {
          trigger: ".testimonials-section",
          start: "top 80%",
        },
        opacity: 0,
        y: 50,
        duration: 0.8,
      });

      gsap.from(".testimonial-card", {
        scrollTrigger: {
          trigger: ".testimonials-grid",
          start: "top 80%",
        },
        opacity: 0,
        x: -100, // Slide in from the left
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.2,
      });

       gsap.from(".cta-content", {
        scrollTrigger: {
          trigger: ".cta-section", // The trigger is the CTA section itself
          start: "top 70%",
        },
        opacity: 0,
        y: 100,
        duration: 1.2,
        ease: "power4.out",
      });

      // This targets the grid of footer links
      gsap.from(".footer-content", {
        scrollTrigger: {
          trigger: ".footer-content",
          start: "top 90%",
        },
        opacity: 0,
        y: 100,
        duration: 1,
        ease: "power3.out",
      });

    }, mainRef); 

    return () => ctx.revert();
  }, []);

  return (
    <div className="home-page" ref={mainRef}>
      <div className="scroll-sequence-container">
      {/* Hero Section */}
      <Hero />
        <FeaturedCategory />
      </div>

        {/* Marquee Section */}
      <Marquee />

      {/* Shop By Category Section */}
      <section id="shop-by-category" className="categories-section">
        <h2 className="section-title">Shop By Category</h2>
        <p className="section-subtitle">
          Find your perfect style across different categories
        </p>
        <CategoryShowcase />
      </section>

    

      {/* UPDATED: We now render your self-contained ProductGrid component directly */}
      <ProductGrid />

       <Testimonials />
          <Footer />
    </div>
  );
}

// import React from "react";

// // Import the components for your homepage
// import Hero from "../components/layout/Hero";
// import FeaturedCategory from "../components/layout/FeaturedCategory";
// import Footer from "../components/layout/Footer"; 
// import Marquee from "../components/layout/Marquee"; // You can add other components back as needed
// import Testimonials from "../components/layout/Testimonials";

// import "./Home.css";

// export default function Home() {
//   // All old GSAP animations have been removed from this file to fix the gap.
//   // The animations should be handled inside each component individually.

//   return (
//     // The extra ".scroll-sequence-container" div is removed.
//     <div className="home-page">
//       <Hero />
//       <FeaturedCategory />
//       {/* You can add your other sections back here if you wish */}
//       {/* <Marquee /> */}
//       {/* <Testimonials /> */}
//       <Footer />
//     </div>
//   );
// }