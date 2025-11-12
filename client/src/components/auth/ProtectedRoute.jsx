import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Changed from useAuthState to useAuth

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth(); // Changed from currentUser to user
  const location = useLocation();

  if (loading) return <p className="text-center mt-8">Loading...</p>;

  return user ? children : <Navigate to="/login" state={{ from: location }} replace />;
};

export default ProtectedRoute;