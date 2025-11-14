import React, { createContext, useContext, useReducer, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

function authReducer(state, action) {
  switch (action.type) {
    case "AUTH_START":
      return { ...state, loading: true, error: null };
    case "AUTH_SUCCESS":
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        error: null,
      };
    case "AUTH_FAILURE":
      return {
        ...state,
        loading: false,
        error: action.payload,
        user: null,
        token: null,
        isAuthenticated: false,
      };
    case "LOGOUT":
      return { ...state, user: null, token: null, isAuthenticated: false, error: null };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
}

// ✅ CRA env variable style
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const setAuthToken = (token) => {
    if (token) {
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
    }
  };

  // Load saved session on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setAuthToken(token);
        dispatch({ type: "AUTH_SUCCESS", payload: { user, token } });
      } catch (err) {
        console.error("Auth restore error:", err);
        setAuthToken(null);
        dispatch({ type: "LOGOUT" });
      }
    }
  }, []);

  const signup = async ({ name, username, email, password }) => {
    try {
      dispatch({ type: "AUTH_START" });
      const { data } = await axios.post(`${API_BASE}/auth/register`, {
        name,
        username,
        email: email.toLowerCase(),
        password,
      });
      setAuthToken(data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      dispatch({ type: "AUTH_SUCCESS", payload: { user: data.user, token: data.token } });
      return { success: true, message: data.message, user: data.user };
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed";
      dispatch({ type: "AUTH_FAILURE", payload: message });
      return { success: false, message };
    }
  };

  
const login = async (credentials) => {
    try {
      dispatch({ type: "AUTH_START" });
      
      const payload = {
      
        login: (credentials.email || credentials.username || credentials.login).toLowerCase(),
        password: credentials.password, 
      };

      console.log(" Sending corrected login request:", payload); 
      const { data } = await axios.post(`${API_BASE}/auth/login`, payload);
      
      setAuthToken(data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      dispatch({ type: "AUTH_SUCCESS", payload: { user: data.user, token: data.token } });
      
      return { success: true, message: data.message, user: data.user };
    } catch (err) {
      const message = err.response?.data?.message || "Login failed. Check your credentials.";
      dispatch({ type: "AUTH_FAILURE", payload: message });
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await axios.post(`${API_BASE}/auth/logout`, {}, { headers: { Authorization: `Bearer ${token}` } });
      }
    } catch (error) {
      console.warn("Logout API error (ignored):", error);
    } finally {
      setAuthToken(null);
      localStorage.removeItem("user");
      dispatch({ type: "LOGOUT" });
    }
  };

  const clearError = () => dispatch({ type: "CLEAR_ERROR" });

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        token: state.token,
        loading: state.loading,
        error: state.error,
        isAuthenticated: state.isAuthenticated,
        signup,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
