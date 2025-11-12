import React from 'react';
import { useNavigate } from 'react-router-dom';
import './FeaturedCategory.css';

// Image imports
import denimImg from '../../images/vintage denims.jpg';
import corsetImg from '../../images/corset.jpeg';
import y2kImg from '../../images/y2k top.webp';
import jacketImg from '../../images/jacket.jpg';
import leatherImg from '../../images/faux leather.jpeg';
import handbagImg from '../../images/handbag.jpg';

// ALL SIX categories are now used
const categoryData = [
  { name: 'Jackets', image: jacketImg, link: '/products?category=leather-jackets' },
  { name: 'Vintage Denims', image: denimImg, link: '/products?category=denim-jeans' },
  { name: 'Faux Leather', image: leatherImg, link: '/products?category=faux-leather' },
  { name: 'Corset Tops', image: corsetImg, link: '/products?category=corset-tops' },
  { name: 'Y2K Tops', image: y2kImg, link: '/products?category=y2k-tops' },
  { name: 'Handbags', image: handbagImg, link: '/products?category=handbags' },
];

export default function FeaturedCategory() {
  const navigate = useNavigate();

  return (
    <section className="category-showcase-container">
      <h2 className="category-showcase-title">Explore Our Styles</h2>
      
      {/* A single grid container now holds all six items */}
      <div className="category-grid">
        {categoryData.map((item) => (
          <div 
            key={item.name} 
            className="category-item" 
            onClick={() => navigate(item.link)}
          >
            <img src={item.image} alt={item.name} />
            <div className="category-caption">{item.name}</div>
          </div>
        ))}
      </div>
    </section>
  );
}