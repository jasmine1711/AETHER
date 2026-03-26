import axios from "axios";

// ✅ FIX: REACT_APP_API_URL should be just the domain (no trailing /api)
const API_BASE = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === "production" 
    ? "https://aether-backend-7uwv.onrender.com" 
    : "http://localhost:5000");

console.log(`🔧 API Base URL: ${API_BASE}`); // For debugging

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Automatically attach token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;