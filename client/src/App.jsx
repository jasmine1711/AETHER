import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Hero from "./components/layout/Hero";
import FeaturedCategory from "./components/layout/FeaturedCategory";


// Auth Pages
import Signup from "./components/auth/Signup";
import Login from "./components/auth/Login";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Shop & Feature Pages
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Wishlist from "./pages/Wishlist";
// import Stylist from './pages/Stylist';

// IMPORT THE COMPONENT
import OutfitSuggestions from './components/OutfitSuggestions'; // Add this import

// Contexts
import { AuthProvider } from "./context/AuthContext";
import { PaymentProvider } from "./context/PaymentContext";
import { CartWishlistProvider } from "./context/CartWishlistContext";
import { AppProvider } from "./context/AppContext";

import "./App.css";

import AIAssistant from './components/AIAssistant';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <CartWishlistProvider>
          <PaymentProvider>
            <Router>
              <div className="App">
                <Navbar />
                <main className="main-content">
                  <Routes>
                    {/* Home Page */}
                    <Route
                      path="/"
                      element={
                        <>
                          <Hero />
                          <FeaturedCategory />
                        </>
                      }
                    />

                    {/* Auth Routes */}
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />

                    {/* Shop Routes */}
                    <Route path="/products" element={<Products />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    
                    {/* Wardrobe Route (Protected) */}
                    <Route
                      path="/wardrobe"
                      element={
                        <ProtectedRoute>
                          <OutfitSuggestions /> 
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* Stylist Route (Protected)
                    <Route
                      path="/stylist"
                      element={
                        <ProtectedRoute>
                          <Stylist />
                        </ProtectedRoute>
                      }
                    /> */}

                    {/* Protected Routes */}
                    <Route
                      path="/cart"
                      element={
                        <ProtectedRoute>
                          <Cart />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/checkout"
                      element={
                        <ProtectedRoute>
                          <Checkout />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </main>
                <AIAssistant /> {/* Moved to main layout */}
                <Footer />
              </div>
            </Router>
          </PaymentProvider>
        </CartWishlistProvider>
      </AppProvider>
    </AuthProvider>
  );
}
export default App;