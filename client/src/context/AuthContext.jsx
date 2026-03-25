import React, { createContext, useContext, useReducer, useEffect } from "react";
import api from "../utils/api"; // ✅ IMPORTANT

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
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
      };

    case "CLEAR_ERROR":
      return { ...state, error: null };

    default:
      return state;
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 🔐 Restore session on refresh
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      dispatch({
        type: "AUTH_SUCCESS",
        payload: { token, user: JSON.parse(user) },
      });
    }
  }, []);

  // ================= REGISTER =================
  const signup = async ({ name, username, email, password }) => {
    try {
      dispatch({ type: "AUTH_START" });

      const { data } = await api.post("/auth/register", {
        name,
        username,
        email: email.toLowerCase(),
        password,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      dispatch({
        type: "AUTH_SUCCESS",
        payload: { user: data.user, token: data.token },
      });

      return { success: true, message: data.message };
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed";
      dispatch({ type: "AUTH_FAILURE", payload: message });
      return { success: false, message };
    }
  };

  // ================= LOGIN =================
  const login = async (credentials) => {
    try {
      dispatch({ type: "AUTH_START" });

      const payload = {
        login: (
          credentials.email ||
          credentials.username ||
          credentials.login
        ).toLowerCase(),
        password: credentials.password,
      };

      const { data } = await api.post("/auth/login", payload);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      dispatch({
        type: "AUTH_SUCCESS",
        payload: { user: data.user, token: data.token },
      });

      return { success: true, message: data.message };
    } catch (err) {
      const message =
        err.response?.data?.message || "Login failed. Check credentials.";
      dispatch({ type: "AUTH_FAILURE", payload: message });
      return { success: false, message };
    }
  };

  // ================= LOGOUT =================
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore API logout failure
    } finally {
      localStorage.removeItem("token");
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
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
