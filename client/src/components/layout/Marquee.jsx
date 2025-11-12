import React from "react";
import "./Marquee.css";

// You can add small icon/image imports here if you want them in the marquee
// import starIcon from '../../images/icons/star.svg'; 

export default function Marquee() {
  return (
    <div className="marquee-container">
      <div className="marquee-content">
        {/* The content is duplicated to create a seamless loop */}
        <span>Premium Fashion Offering Meticulously Crafted Clothing</span>
        {/* <img src={starIcon} alt="icon" className="marquee-icon" /> */}
        <span>Contemporary Aesthetics for Individuals Who Appreciate Style</span>
        {/* <img src={starIcon} alt="icon" className="marquee-icon" /> */}
        <span>Premium Fashion Offering Meticulously Crafted Clothing</span>
        {/* <img src={starIcon} alt="icon" className="marquee-icon" /> */}
        <span>Contemporary Aesthetics for Individuals Who Appreciate Style</span>
      </div>
    </div>
  );
}