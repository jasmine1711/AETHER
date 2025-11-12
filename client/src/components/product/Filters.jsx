// src/components/Filters.jsx
import React from 'react';

const Filters = ({ filters, onChange }) => {
  const filterButtons = [
    { key: 'all', label: 'All' },
    { key: 'clothing', label: 'Clothing' },
    { key: 'footwear', label: 'Footwear' },
    { key: 'accessories', label: 'Accessories' },
    { key: 'new', label: 'New Arrivals' },
    { key: 'sale', label: 'On Sale' }
  ];

  const handleButtonFilterChange = (filterKey) => {
    onChange((prev) => ({
      ...prev,
      category: filterKey === 'all' ? '' : filterKey
    }));
  };

  const handleFormFilterChange = (field, value) => {
    onChange((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="mb-8 space-y-4">
      {/* Button Filters */}
      <div className="flex flex-wrap gap-2 justify-center">
        {filterButtons.map((filter) => (
          <button
            key={filter.key}
            className={`px-4 py-2 rounded-full transition-all duration-200 ${
              filters.category === filter.key 
                ? 'bg-yellow-500 text-gray-900 font-semibold' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => handleButtonFilterChange(filter.key)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Form Filters (Search, Sort, Category Dropdown) */}
      <div className="flex flex-wrap gap-3 justify-center items-center bg-gray-800 p-4 rounded-lg">
        <select 
          className="border border-gray-600 bg-gray-700 text-white p-2 rounded focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          value={filters.category || ''}
          onChange={(e) => handleFormFilterChange('category', e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="clothing">Clothing</option>
          <option value="footwear">Footwear</option>
          <option value="accessories">Accessories</option>
        </select>
        
        <select 
          className="border border-gray-600 bg-gray-700 text-white p-2 rounded focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          value={filters.sort || ''}
          onChange={(e) => handleFormFilterChange('sort', e.target.value)}
        >
          <option value="">Sort By</option>
          <option value="priceAsc">Price: Low → High</option>
          <option value="priceDesc">Price: High → Low</option>
        </select>
        
        <input 
          className="border border-gray-600 bg-gray-700 text-white p-2 rounded focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          placeholder="Search products..."
          value={filters.q || ''}
          onChange={(e) => handleFormFilterChange('q', e.target.value)}
        />
      </div>
    </div>
  );
};

export default Filters;
