import React, { createContext, useContext, useReducer, useEffect } from "react";
import api from "../utils/api"; // ✅ shared axios instance

const AppContext = createContext();
export const useApp = () => useContext(AppContext);

const initialState = {
  products: [],
  cart: [],
  wishlist: [],
  loading: true,
  error: null,
};

function appReducer(state, action) {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "SET_PRODUCTS":
      return { ...state, products: action.payload, loading: false };
    case "ADD_TO_CART":
      return { ...state, cart: [...state.cart, action.payload] };
    case "REMOVE_FROM_CART":
      return {
        ...state,
        cart: state.cart.filter((item) => item.id !== action.payload),
      };
    case "UPDATE_CART_QUANTITY":
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    case "CLEAR_CART":
      return { ...state, cart: [] };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 🔹 Cart actions
  const addToCart = (product) => {
    dispatch({ type: "ADD_TO_CART", payload: { ...product, quantity: 1 } });
  };

  const removeFromCart = (productId) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: productId });
  };

  const updateCartQuantity = (productId, quantity) => {
    dispatch({
      type: "UPDATE_CART_QUANTITY",
      payload: { id: productId, quantity },
    });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  // 🔹 Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const { data } = await api.get("/products"); // ✅ cleaner backend call
        dispatch({ type: "SET_PRODUCTS", payload: data });
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: error.message });
      }
    };
    fetchProducts();
  }, []);

  const value = {
    ...state,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
  };

  return (
    <AppContext.Provider value={value}>
      {state.loading ? (
        <div style={{ textAlign: "center", marginTop: "2rem" }}>Loading...</div>
      ) : (
        children
      )}
    </AppContext.Provider>
  );
}

// ✅ Custom hook for cart
export const useCart = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useCart must be used within an AppProvider");
  }
  return {
    cart: context.cart,
    addToCart: context.addToCart,
    removeFromCart: context.removeFromCart,
    updateCartQuantity: context.updateCartQuantity,
    clearCart: context.clearCart,
  };
};
