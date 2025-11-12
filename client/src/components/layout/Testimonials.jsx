import React from 'react';
import './Testimonials.css'; // We'll create this CSS file

// Sample testimonial data
const testimonials = [
  {
    id: 1,
    name: 'Emma',
    avatar: '/images/avatars/avatar1.jpg',
    quote: "The quality is unmatched! I've never felt more confident in what I wear. The fabric feels like it was made just for me."
  },
  {
    id: 2,
    name: 'Sarah',
    avatar: '/images/avatars/avatar2.jpg',
    quote: "I love how versatile the collections are. Whether it's a casual day out or a formal event, I always find something perfect!"
  },
  {
    id: 3,
    name: 'Daniel',
    avatar: '/images/avatars/avatar3.jpg',
    quote: "The attention to detail in every design is impressive. The cut, everything is just perfect. My go-to brand for fashion."
  },
];

export default function Testimonials() {
  return (
    <section className="testimonials-section">
      <h2 className="section-title">Discover what our clients are saying</h2>
      <div className="testimonials-grid">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="testimonial-card">
            <img src={testimonial.avatar} alt={testimonial.name} className="testimonial-avatar" />
            <p className="testimonial-quote">"{testimonial.quote}"</p>
            <div className="testimonial-rating">★★★★★</div>
            <h3 className="testimonial-name">— {testimonial.name}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}