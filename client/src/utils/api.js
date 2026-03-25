import axios from "axios";

// ✅ FIX: Remove /api from base URL since all endpoints already include it
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE,  // Now it's just the domain, no /api
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