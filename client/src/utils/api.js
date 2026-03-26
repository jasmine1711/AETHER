import axios from "axios";

// ✅ FIX: Use environment variable with fallback
const API_BASE = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === "production" 
    ? "https://aether-backend-7uwv.onrender.com" 
    : "http://localhost:5000");

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