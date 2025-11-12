import React, { useLayoutEffect, useRef } from "react";

import { gsap } from "gsap";

import "./Hero.css";



// Image paths for the philosophy section

const image1 = "/images/hero/3.avif";

const image2 = "/images/hero/4.avif";



// Video paths from your public/images/hero/ folder

const video1 = "/images/hero/7.mp4";

const video2 = "/images/hero/8.mp4";



export default function Hero() {

  const sectionRef = useRef(null);

  const curtainRefs = useRef([]);



  useLayoutEffect(() => {

    let ctx = gsap.context(() => {

      // Animate the curtains moving up

      gsap.to(curtainRefs.current, {

        yPercent: -100,

        duration: 1.5,

        ease: "power4.inOut",

        stagger: 0.1,

        delay: 0.5,

      });



      // Animate the content fading in after the curtains open

      gsap.from(".philosophy-text-content, .philosophy-image-gallery", {

        opacity: 0,

        y: 40,

        duration: 1,

        ease: "power3.out",

        stagger: 0.2,

        delay: 1.2,

      });



    }, sectionRef);

    return () => ctx.revert();

  }, []);



  return (

    // We wrap both sections in a Fragment

    <>

      {/* SECTION 1: PHILOSOPHY */}

      <section className="philosophy-section" ref={sectionRef}>

        <div className="philosophy-text-content">

          <h2>Our Philosophy</h2>

          <p>

            We set out to solve two problems. The first was philosophical: to restore the

            authenticity of fashion where clothes are valued. The second was experimental:

            to provide a digital home for this philosophy, creating a seamless experience

            that respects the quality and care put into our collection.

          </p>

        </div>

        <div className="philosophy-image-gallery">

          <div className="image-wrapper">

            <img src={image1} alt="A model showcasing the brand's aesthetic" />

          </div>

          <div className="image-wrapper">

            <img src={image2} alt="A second model in a different outfit from the collection" />

          </div>

        </div>

        <div className="curtain-container">

          <div className="curtain" ref={el => curtainRefs.current[0] = el}>

            <div className="curtain-bg" style={{ backgroundImage: `url(/images/hero/1.avif)`}}></div>

          </div>

          <div className="curtain" ref={el => curtainRefs.current[1] = el}>

            <div className="curtain-bg" style={{ backgroundImage: `url(/images/hero/2.avif)`}}></div>

          </div>

          <div className="curtain" ref={el => curtainRefs.current[2] = el}>

            <div className="curtain-bg" style={{ backgroundImage: `url(/images/hero/3.avif)`}}></div>

          </div>

        </div>

      </section>



      {/* ADDED - SECTION 2: VIDEO SHOWCASE */}

      <section className="video-showcase-section">

        <div className="video-container">

          <video src={video1} className="showcase-video" autoPlay muted loop playsInline />

        </div>

        <div className="video-container">

          <video src={video2} className="showcase-video" autoPlay muted loop playsInline />

        </div>

      </section>

    </>

  );

}