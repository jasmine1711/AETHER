// src/pages/Stylist.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import OutfitSuggestions from '../components/OutfitSuggestions';
import './Stylist.css';

const Stylist = () => {
  const [wardrobeItems, setWardrobeItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    fetchWardrobeItems();
    fetchUserProfile();
  }, []);

  const fetchWardrobeItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/garments', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Handle different response formats
      if (response.data && Array.isArray(response.data)) {
        setWardrobeItems(response.data);
      } else if (response.data && response.data.garments) {
        setWardrobeItems(response.data.garments);
      } else if (response.data && response.data.data) {
        setWardrobeItems(response.data.data);
      } else {
        setWardrobeItems([]);
      }
    } catch (error) {
      console.error('Error fetching wardrobe items:', error);
      // Set sample data for testing
      setWardrobeItems([
        { name: "White Linen Shirt", category: "Top", color: "White", style: "Minimalist" },
        { name: "Dark Wash Jeans", category: "Bottom", color: "Blue", style: "Casual" },
        { name: "Brown Leather Belt", category: "Accessory", color: "Brown", style: "Classic" },
        { name: "White Sneakers", category: "Shoes", color: "White", style: "Minimalist" },
        { name: "Black Blazer", category: "Jacket", color: "Black", style: "Formal" },
        { name: "Little Black Dress", category: "Dress", color: "Black", style: "Classic" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/users/profile', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.user) {
        setUserProfile(response.data.user);
      }
    } catch (error) {
      console.log('Could not fetch user profile, using defaults');
      // Set default profile
      setUserProfile({
        bodyType: 'hourglass',
        skinTone: 'warm',
        stylePreferences: ['Minimalist']
      });
    }
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner"></div>
        <p>Loading your style profile...</p>
      </div>
    );
  }

  return (
    <div className="stylist-page">
      <div className="page-header">
        <h1>✨ Aether AI Stylist</h1>
        <p className="page-subtitle">Your personal fashion assistant powered by AI</p>
      </div>

      {userProfile && (
        <div className="user-profile-banner">
          <div className="profile-info">
            <h3>Your Style Profile</h3>
            <div className="profile-details">
              <span className="profile-badge">Body Type: {userProfile.bodyType || 'Not set'}</span>
              <span className="profile-badge">Skin Tone: {userProfile.skinTone || 'Not set'}</span>
              <span className="profile-badge">Style: {userProfile.stylePreferences?.join(', ') || 'Not set'}</span>
            </div>
            <a href="/profile" className="edit-profile-link">Edit Profile →</a>
          </div>
          <div className="wardrobe-stats">
            <h4>Your Wardrobe</h4>
            <p className="item-count">{wardrobeItems.length} items</p>
            <a href="/wardrobe" className="view-wardrobe-link">View Wardrobe →</a>
          </div>
        </div>
      )}

      <OutfitSuggestions wardrobeItems={wardrobeItems} />

      <div className="stylist-info">
        <h3>How Aether AI Stylist Works</h3>
        <div className="info-cards">
          <div className="info-card">
            <div className="info-icon">👗</div>
            <h4>1. Analyze Your Wardrobe</h4>
            <p>AI scans your uploaded clothing items and understands your style</p>
          </div>
          <div className="info-card">
            <div className="info-icon">🤖</div>
            <h4>2. AI-Powered Suggestions</h4>
            <p>Generates outfits based on your body type, occasion, and preferences</p>
          </div>
          <div className="info-card">
            <div className="info-icon">🎯</div>
            <h4>3. Personalized Styling</h4>
            <p>Provides specific tips and reasoning for each outfit combination</p>
          </div>
          <div className="info-card">
            <div className="info-icon">💾</div>
            <h4>4. Save & Rate</h4>
            <p>Save your favorite outfits and rate them for better future suggestions</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stylist;