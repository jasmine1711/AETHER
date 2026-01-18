// In your parent component (e.g., WardrobePage.jsx)
import React, { useState, useEffect } from 'react';
import OutfitSuggestions from '../components/OutfitSuggestions';
import axios from 'axios';

const WardrobePage = () => {
  const [wardrobeItems, setWardrobeItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWardrobeItems();
  }, []);

  const fetchWardrobeItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/garments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWardrobeItems(response.data || []);
    } catch (error) {
      console.error('Error fetching wardrobe items:', error);
      setWardrobeItems([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading wardrobe...</div>;
  }

  return (
    <div className="wardrobe-page">
      <h1>My Wardrobe</h1>
      <p>You have {wardrobeItems.length} items in your wardrobe</p>
      
      <OutfitSuggestions wardrobeItems={wardrobeItems} />
    </div>
  );
};

export default WardrobePage;