import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// FIX: Add file extensions to all local imports
import App from './App.jsx'; 
import reportWebVitals from './reportWebVitals.js';
import { AuthProvider } from "./context/AuthContext.jsx"; 
import { CartWishlistProvider } from './context/CartWishlistContext.jsx'; 
import { PaymentProvider } from "./context/PaymentContext.jsx"; 


const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <CartWishlistProvider>
        <PaymentProvider>
          <App />
        </PaymentProvider>
      </CartWishlistProvider>
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();