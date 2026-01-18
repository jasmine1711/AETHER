// src/components/OutfitSuggestions.jsx
import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import './OutfitSuggestions.css';

const OutfitSuggestions = () => {
  const [wardrobeItems, setWardrobeItems] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [filters, setFilters] = useState({
    bodyType: 'hourglass',
    event: 'casual',
    timeOfDay: 'day',
    season: 'all',
    colorPalette: 'neutral'
  });

  const generateSampleWardrobe = () => {
    return [
      { name: "White Linen Shirt", category: "Top", color: "White", style: "Minimalist" },
      { name: "Blue Jeans", category: "Bottom", color: "Blue", style: "Casual" },
      { name: "Black Blazer", category: "Jacket", color: "Black", style: "Formal" },
      { name: "White Sneakers", category: "Shoes", color: "White", style: "Minimalist" },
      { name: "Brown Leather Belt", category: "Accessory", color: "Brown", style: "Classic" },
      { name: "Little Black Dress", category: "Dress", color: "Black", style: "Classic" },
      { name: "Striped T-Shirt", category: "Top", color: "Navy/White", style: "Casual" },
      { name: "Denim Jacket", category: "Jacket", color: "Blue", style: "Casual" }
    ];
  };

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          try {
            const profileRes = await axios.get('http://localhost:5000/api/users/profile', {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (profileRes.data?.user) {
              setUserProfile(profileRes.data.user);
              if (profileRes.data.user.bodyType) {
                setFilters(prev => ({ ...prev, bodyType: profileRes.data.user.bodyType }));
              }
            }
          } catch (profileError) {
            console.log('Using default profile');
            setUserProfile({
              bodyType: 'hourglass',
              stylePreferences: ['minimalist']
            });
          }

          try {
            const wardrobeRes = await axios.get('http://localhost:5000/api/garments', {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (wardrobeRes.data && Array.isArray(wardrobeRes.data)) {
              setWardrobeItems(wardrobeRes.data);
            } else if (wardrobeRes.data?.garments) {
              setWardrobeItems(wardrobeRes.data.garments);
            } else if (wardrobeRes.data?.data) {
              setWardrobeItems(wardrobeRes.data.data);
            }
          } catch (wardrobeError) {
            console.log('No wardrobe items found, using sample data');
            setWardrobeItems(generateSampleWardrobe());
          }
        } else {
          setWardrobeItems(generateSampleWardrobe());
          setUserProfile({
            bodyType: 'hourglass',
            stylePreferences: ['minimalist']
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setWardrobeItems(generateSampleWardrobe());
        setUserProfile({
          bodyType: 'hourglass',
          stylePreferences: ['minimalist']
        });
      }
    };

    fetchUserData();
  }, []);

  // Get specific outfit images based on outfit type and filters
  const getOutfitImage = (outfitName, event, bodyType, season) => {
    const imageMap = {
      // Casual outfits
      'Minimalist Casual': {
        spring: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=800&fit=crop&q=80',
        summer: 'https://images.unsplash.com/photo-1525507119023-78d3c7d8dcf9?w=600&h=800&fit=crop&q=80',
        fall: 'https://images.unsplash.com/photo-1505022610485-0249ba5b3675?w=600&h=800&fit=crop&q=80',
        winter: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&h=800&fit=crop&q=80',
        default: 'https://images.unsplash.com/photo-1525507119023-78d3c7d8dcf9?w=600&h=800&fit=crop&q=80'
      },
      'Weekend Comfort': {
        spring: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=800&fit=crop&q=80',
        summer: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&h=800&fit=crop&q=80',
        fall: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600&h=800&fit=crop&q=80',
        winter: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&h=800&fit=crop&q=80',
        default: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600&h=800&fit=crop&q=80'
      },
      'Smart Casual': {
        spring: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=800&fit=crop&q=80',
        summer: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&h=800&fit=crop&q=80',
        fall: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=800&fit=crop&q=80',
        winter: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&h=800&fit=crop&q=80',
        default: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=800&fit=crop&q=80'
      },
      // Work outfits
      'Professional Minimalist': {
        spring: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&h=800&fit=crop&q=80',
        summer: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop&q=80',
        fall: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=600&h=800&fit=crop&q=80',
        winter: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=800&fit=crop&q=80',
        default: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&h=800&fit=crop&q=80'
      },
      'Smart Office': {
        default: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=800&fit=crop&q=80'
      },
      // Date outfits
      'Elegant Evening': {
        default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop&q=80'
      },
      'Casual Romantic': {
        default: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=600&h=800&fit=crop&q=80'
      },
      // Party outfits
      'Night Out Glam': {
        default: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=800&fit=crop&q=80'
      }
    };

    const outfitImages = imageMap[outfitName] || imageMap['Smart Casual'];
    const seasonKey = (season === 'all' || season === 'all seasons') ? 'default' : season;
    
    return outfitImages[seasonKey] || outfitImages['default'] || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=800&fit=crop&q=80';
  };

  const generateOutfitSuggestions = async () => {
    setLoading(true);
    
    try {
      const generatedOutfits = [];
      let outfitTypes = [];
      
      switch(filters.event) {
        case 'work':
          outfitTypes = [
            {
              name: "Professional Minimalist",
              items: ["Black Blazer", "White Linen Shirt", "Tailored Pants", "Leather Loafers", "Minimal Watch"],
              formality: "Business Casual",
              season: filters.season === 'all' ? "All" : filters.season
            },
            {
              name: "Smart Office",
              items: ["Gray Blazer", "Striped T-Shirt", "Blue Jeans", "Brown Belt", "Loafers"],
              formality: "Smart Casual",
              season: filters.season === 'all' ? "All" : filters.season
            }
          ];
          break;
        case 'date':
          outfitTypes = [
            {
              name: "Elegant Evening",
              items: ["Little Black Dress", "Statement Earrings", "Black Heels", "Clutch Bag", "Red Lipstick"],
              formality: "Formal",
              season: filters.season === 'all' ? "All" : filters.season
            },
            {
              name: "Casual Romantic",
              items: ["Denim Jacket", "Striped T-Shirt", "Blue Jeans", "White Sneakers", "Crossbody Bag"],
              formality: "Casual",
              season: filters.season === 'all' ? "All" : filters.season
            }
          ];
          break;
        case 'party':
          outfitTypes = [
            {
              name: "Night Out Glam",
              items: ["Sequined Top", "Black Leather Pants", "Statement Heels", "Clutch", "Bold Earrings"],
              formality: "Party",
              season: filters.season === 'all' ? "All" : filters.season
            }
          ];
          break;
        default:
          outfitTypes = [
            {
              name: "Minimalist Casual",
              items: ["White Linen Shirt", "Blue Jeans", "White Sneakers", "Brown Leather Belt", "Watch"],
              formality: "Casual",
              season: filters.season === 'all' ? "All" : filters.season
            },
            {
              name: "Weekend Comfort",
              items: ["Striped T-Shirt", "Denim Jacket", "Blue Jeans", "White Sneakers", "Backpack"],
              formality: "Casual",
              season: filters.season === 'all' ? "Spring/Summer" : filters.season
            },
            {
              name: "Smart Casual",
              items: ["Black Blazer", "White Linen Shirt", "Blue Jeans", "Leather Loafers", "Sunglasses"],
              formality: "Smart Casual",
              season: filters.season === 'all' ? "All" : filters.season
            }
          ];
      }

      for (const outfit of outfitTypes) {
        const imageUrl = getOutfitImage(
          outfit.name, 
          filters.event, 
          filters.bodyType,
          filters.season
        );
        
        generatedOutfits.push({
          id: Date.now() + Math.random(),
          outfitName: outfit.name,
          items: outfit.items,
          reasoning: `Perfect for ${filters.event} ${filters.timeOfDay !== 'any' ? filters.timeOfDay : ''} occasions. This outfit complements ${filters.bodyType} body type with ${filters.colorPalette} color palette.`,
          stylingTips: [
            "Accessorize according to the occasion",
            "Ensure proper fit for your body type",
            `Choose ${filters.colorPalette} colored accessories`,
            "Layer pieces for added dimension"
          ],
          imageUrl: imageUrl,
          formalityLevel: outfit.formality,
          season: outfit.season,
          bodyTypeTips: getBodyTypeTips(filters.bodyType)
        });
      }

      setSuggestions(generatedOutfits);
    } catch (error) {
      console.error('Error generating outfits:', error);
      setSuggestions([
        {
          id: 1,
          outfitName: "Classic Casual",
          items: ["White Shirt", "Dark Jeans", "Sneakers", "Watch", "Sunglasses"],
          reasoning: `Perfect for ${filters.event} occasions. This outfit complements ${filters.bodyType} body type.`,
          stylingTips: ["Roll up sleeves", "Add a watch", "Choose comfortable shoes"],
          imageUrl: getOutfitImage("Minimalist Casual", filters.event, filters.bodyType, filters.season),
          formalityLevel: "Casual",
          season: "All Season",
          bodyTypeTips: getBodyTypeTips(filters.bodyType)
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getBodyTypeTips = (bodyType) => {
    const tips = {
      hourglass: "Emphasize waist with belts, wear fitted clothing, try wrap dresses, use high-waisted bottoms",
      pear: "Balance with statement tops, wear A-line skirts, darker bottoms, try wide-leg pants",
      apple: "Create vertical lines, empire waist dresses, V-neck tops, highlight legs with skirts",
      rectangle: "Create curves with peplums, wear belted dresses, try ruffles and layers",
      'inverted triangle': "Balance shoulders with fuller bottoms, V-neck tops, A-line skirts"
    };
    return tips[bodyType] || "Focus on balanced proportions and personal comfort. Choose clothes that make you feel confident!";
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      bodyType: userProfile?.bodyType || 'hourglass',
      event: 'casual',
      timeOfDay: 'day',
      season: 'all',
      colorPalette: 'neutral'
    });
  };

  const saveOutfit = (outfit) => {
    const savedOutfits = JSON.parse(localStorage.getItem('savedOutfits') || '[]');
    savedOutfits.push({
      ...outfit,
      savedAt: new Date().toISOString()
    });
    localStorage.setItem('savedOutfits', JSON.stringify(savedOutfits));
    alert('Outfit saved to your collection!');
  };

  return (
    <div className="outfit-suggestions-page">
      <div className="page-header-section">
        <h1 className="page-title">👗 Aether AI Outfit Generator</h1>
        <p className="page-subtitle">Get personalized outfit suggestions based on your style profile</p>
      </div>

      <div className="main-content-grid">
        <div className="filters-sidebar">
          <div className="filters-header">
            <h3>Style Preferences</h3>
            <button onClick={clearFilters} className="clear-filters-btn">
              Clear All
            </button>
          </div>

          <div className="filter-group">
            <label>Body Type</label>
            <select 
              value={filters.bodyType}
              onChange={(e) => handleFilterChange('bodyType', e.target.value)}
              className="filter-select"
            >
              <option value="hourglass">Hourglass</option>
              <option value="pear">Pear (Triangle)</option>
              <option value="apple">Apple</option>
              <option value="rectangle">Rectangle</option>
              <option value="inverted triangle">Inverted Triangle</option>
            </select>
            <p className="filter-tip">{getBodyTypeTips(filters.bodyType)}</p>
          </div>

          <div className="filter-group">
            <label>Occasion/Event</label>
            <select 
              value={filters.event}
              onChange={(e) => handleFilterChange('event', e.target.value)}
              className="filter-select"
            >
              <option value="casual">Casual</option>
              <option value="work">Work/Office</option>
              <option value="date">Date Night</option>
              <option value="party">Party</option>
              <option value="formal">Formal Event</option>
              <option value="travel">Travel</option>
              <option value="gym">Gym/Workout</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Time of Day</label>
            <select 
              value={filters.timeOfDay}
              onChange={(e) => handleFilterChange('timeOfDay', e.target.value)}
              className="filter-select"
            >
              <option value="day">Day</option>
              <option value="evening">Evening</option>
              <option value="night">Night</option>
              <option value="any">Any Time</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Season</label>
            <select 
              value={filters.season}
              onChange={(e) => handleFilterChange('season', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Seasons</option>
              <option value="spring">Spring</option>
              <option value="summer">Summer</option>
              <option value="fall">Fall</option>
              <option value="winter">Winter</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Color Palette</label>
            <select 
              value={filters.colorPalette}
              onChange={(e) => handleFilterChange('colorPalette', e.target.value)}
              className="filter-select"
            >
              <option value="neutral">Neutral (Black, White, Gray)</option>
              <option value="warm">Warm (Browns, Oranges, Reds)</option>
              <option value="cool">Cool (Blues, Greens, Purples)</option>
              <option value="pastel">Pastel</option>
              <option value="bold">Bold & Bright</option>
            </select>
          </div>

          <div className="wardrobe-summary-card">
            <h4>Your Wardrobe</h4>
            <div className="wardrobe-stats">
              <span className="stat-number">{wardrobeItems.length}</span>
              <span className="stat-label">items available</span>
            </div>
            <div className="wardrobe-categories">
              {Array.from(new Set(wardrobeItems.map(item => item.category)))
                .slice(0, 5)
                .map(category => (
                  <span key={category} className="category-tag">{category}</span>
                ))}
            </div>
            <a href="/wardrobe/add" className="add-items-link">
              + Add More Items
            </a>
          </div>

          <button 
            onClick={generateOutfitSuggestions}
            disabled={loading}
            className="generate-outfits-btn"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Generating Outfits...
              </>
            ) : (
              '✨ Generate Outfit Ideas'
            )}
          </button>
        </div>

        <div className="outfits-content">
          {suggestions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👗</div>
              <h3>Ready to Get Styled?</h3>
              <p>Configure your preferences and generate AI-powered outfit suggestions!</p>
              
              <div className="quick-tips-card">
                <h4>💡 Pro Tips:</h4>
                <ul>
                  <li>Select your body type for personalized fits</li>
                  <li>Choose occasion for appropriate outfits</li>
                  <li>Images match the selected outfit and season</li>
                  <li>Save outfits you like for future reference</li>
                  <li>Add more items to your wardrobe for better suggestions</li>
                </ul>
              </div>
            </div>
          ) : (
            <>
              <div className="results-header">
                <h2>🎯 Generated Outfits ({suggestions.length})</h2>
                <div className="active-filters">
                  <span className="active-filter">Body: {filters.bodyType}</span>
                  <span className="active-filter">Event: {filters.event}</span>
                  <span className="active-filter">Colors: {filters.colorPalette}</span>
                  {filters.season !== 'all' && <span className="active-filter">Season: {filters.season}</span>}
                  {filters.timeOfDay !== 'any' && <span className="active-filter">Time: {filters.timeOfDay}</span>}
                </div>
              </div>

              <div className="outfits-grid">
                {suggestions.map((outfit, index) => (
                  <div key={outfit.id || index} className="outfit-card">
                    <div className="outfit-image-wrapper">
                      <img 
                        src={outfit.imageUrl} 
                        alt={`${outfit.outfitName} outfit`}
                        className="outfit-image"
                        onError={(e) => {
                          e.target.src = getOutfitImage("Minimalist Casual", filters.event, filters.bodyType, filters.season);
                        }}
                      />
                      <div className="outfit-overlay">
                        <span className="formality-badge">{outfit.formalityLevel}</span>
                        <span className="season-badge">{outfit.season}</span>
                      </div>
                    </div>

                    <div className="outfit-details">
                      <div className="outfit-title-section">
                        <h3>{outfit.outfitName}</h3>
                        <button 
                          onClick={() => saveOutfit(outfit)}
                          className="save-outfit-icon"
                          title="Save this outfit"
                        >
                          💾
                        </button>
                      </div>
                      
                      <div className="outfit-items">
                        <h4>🧥 Items Needed:</h4>
                        <ul>
                          {outfit.items.map((item, i) => {
                            const hasItem = wardrobeItems.some(w => 
                              w.name?.toLowerCase().includes(item.toLowerCase()) ||
                              item.toLowerCase().includes(w.name?.toLowerCase())
                            );
                            return (
                              <li key={i} className={hasItem ? 'has-item' : 'needs-item'}>
                                <span className="item-name">{item}</span>
                                <span className="item-status">
                                  {hasItem ? '✓ In Wardrobe' : '✗ Add to Wardrobe'}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      <div className="styling-section">
                        <h4>💡 Styling Tips:</h4>
                        <ul>
                          {outfit.stylingTips.map((tip, i) => (
                            <li key={i}>{tip}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="body-type-tips-section">
                        <h4>👤 For {filters.bodyType} Body Type:</h4>
                        <p>{outfit.bodyTypeTips}</p>
                      </div>

                      <div className="outfit-actions">
                        <button 
                          onClick={() => saveOutfit(outfit)}
                          className="save-outfit-btn"
                        >
                          💾 Save Outfit
                        </button>
                        <button 
                          onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(`${outfit.outfitName} outfit shop online`)}`, '_blank')}
                          className="shop-similar-btn"
                        >
                          🛒 Shop Similar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OutfitSuggestions;