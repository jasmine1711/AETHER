import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import api from "../utils/api";
import { useAuth } from "./AuthContext";

export const CartWishlistContext = createContext();

export function CartWishlistProvider({ children }) {
  const { token } = useAuth();
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Memoize API instance instead of recreating function
  const authApi = useMemo(
    () =>
      token
        ? api.create({ headers: { Authorization: `Bearer ${token}` } })
        : api,
    [token]
  );

  const normalizeItem = useCallback(
    (item) => ({
      id: item.slug ?? item._id ?? `temp-${Math.random()}`,
      quantity: item.quantity ?? 1,
      size: item.size ?? "",
      name: item.name ?? "Untitled Product",
      price: Number(item.price ?? 0),
      thumbnail: item.thumbnail ?? item.images?.[0] ?? "/images/default.jpg",
      category: item.category ?? "Uncategorized",
      brand: item.brand ?? "Unknown Brand",
      _id: item._id ?? null,
      cartItemId: item.cartItemId,
    }),
    []
  );

  // ✅ Centralized error handler
  const handleError = (err, message) => {
    console.error(message, err.response?.data || err.message);
    setError(message);
  };

  // ================== FETCH ==================
  const fetchCart = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await authApi.get("/cart");
      if (data?.items) {
        const flattenedItems = data.items.map((item) =>
          !item.product
            ? {
                name: "Product no longer available",
                price: 0,
                images: [],
                quantity: item.quantity,
                size: item.size,
                cartItemId: item._id,
                id: `deleted-${item._id}`,
                _id: null,
              }
            : {
                ...item.product,
                quantity: item.quantity,
                size: item.size,
                cartItemId: item._id,
              }
        );
        setCart(flattenedItems.map(normalizeItem));
      } else {
        setCart([]);
      }
    } catch (err) {
      handleError(err, "Could not load your cart.");
      setCart([]);
    } finally {
      setLoading(false);
    }
  }, [token, normalizeItem, authApi]);

  const fetchWishlist = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await authApi.get("/wishlist");
      if (data?.products) {
        setWishlist(data.products.map(normalizeItem));
      } else {
        setWishlist([]);
      }
    } catch (err) {
      handleError(err, "Could not load your wishlist.");
    }
  }, [token, normalizeItem, authApi]);

  // ================== INITIAL LOAD ==================
  useEffect(() => {
    if (token) {
      Promise.all([fetchCart(), fetchWishlist()]);
    } else {
      try {
        const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
        setCart(
          Array.isArray(storedCart) ? storedCart.map(normalizeItem) : []
        );
        const storedWishlist = JSON.parse(
          localStorage.getItem("wishlist") || "[]"
        );
        setWishlist(
          Array.isArray(storedWishlist)
            ? storedWishlist.map(normalizeItem)
            : []
        );
      } catch {
        setCart([]);
        setWishlist([]);
      }
    }
  }, [token, fetchCart, fetchWishlist, normalizeItem]);

  // ================== LOCAL STORAGE PERSIST ==================
  useEffect(() => {
    if (!token && !loading) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, token, loading]);

  useEffect(() => {
    if (!token && !loading) {
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }
  }, [wishlist, token, loading]);

  // ================== CART ==================
  const addToCart = useCallback(
    async (item) => {
      const normalized = normalizeItem(item);
      const payload = {
        productId: normalized._id,
        quantity: normalized.quantity || 1,
        size: normalized.size,
      };

      if (!token) {
        setCart((prev) => {
          const idx = prev.findIndex(
            (p) =>
              p.id === normalized.id &&
              (p.size || "") === (normalized.size || "")
          );
          if (idx > -1) {
            const updated = [...prev];
            updated[idx].quantity += normalized.quantity || 1;
            return updated;
          }
          return [...prev, { ...normalized, quantity: normalized.quantity || 1 }];
        });
        return;
      }

      try {
        const { data } = await authApi.post("/cart", payload);
        if (data?.items) {
          const flattenedItems = data.items.map((item) => ({
            ...item.product,
            quantity: item.quantity,
            size: item.size,
            cartItemId: item._id,
          }));
          setCart(flattenedItems.map(normalizeItem));
        }
      } catch (err) {
        handleError(err, "Failed to add item to cart. Please try again.");
      }
    },
    [token, normalizeItem, authApi]
  );

  const removeFromCart = useCallback(
    async (cartItemId) => {
      if (!token) {
        setCart((prev) => prev.filter((p) => p.cartItemId !== cartItemId));
        return;
      }
      try {
        setCart((prev) => prev.filter((p) => p.cartItemId !== cartItemId));
        await authApi.delete(`/cart/item/${cartItemId}`);
      } catch (err) {
        handleError(err, "Failed to remove item.");
        fetchCart(); // rollback on failure
      }
    },
    [token, authApi, fetchCart]
  );

  const updateQuantity = useCallback(
    async (cartItemId, quantity) => {
      if (!token) {
        setCart((prev) =>
          prev.map((p) =>
            p.cartItemId === cartItemId
              ? { ...p, quantity: Math.max(1, quantity) }
              : p
          )
        );
        return;
      }
      try {
        setCart((prev) =>
          prev.map((p) =>
            p.cartItemId === cartItemId ? { ...p, quantity } : p
          )
        );
        await authApi.put(`/cart/item/${cartItemId}`, { quantity });
      } catch (err) {
        handleError(err, "Failed to update quantity.");
        fetchCart(); // rollback on failure
      }
    },
    [token, authApi, fetchCart]
  );

  const clearCart = useCallback(async () => {
    if (token) {
      try {
        await authApi.delete("/cart");
      } catch (err) {
        handleError(err, "Failed to clear cart.");
      }
    } else {
      localStorage.removeItem("cart");
    }
    setCart([]);
  }, [token, authApi]);

  // ================== WISHLIST ==================
  const addToWishlist = useCallback(
    async (item) => {
      const normalized = normalizeItem(item);
      const payloadId = normalized._id;

      if (!token) {
        setWishlist((prev) =>
          prev.some((p) => p.id === normalized.id) ? prev : [...prev, normalized]
        );
        return;
      }
      try {
        const { data } = await authApi.post(`/wishlist/${payloadId}`);
        if (data?.products) {
          setWishlist(data.products.map(normalizeItem));
        }
      } catch (err) {
        handleError(err, "Failed to add item to wishlist.");
      }
    },
    [token, wishlist, normalizeItem, authApi]
  );

  const removeFromWishlist = useCallback(
    async (productId) => {
      if (!token) {
        setWishlist((prev) => prev.filter((p) => p._id !== productId));
        return;
      }
      try {
        setWishlist((prev) => prev.filter((p) => p._id !== productId));
        await authApi.delete(`/wishlist/${productId}`);
      } catch (err) {
        handleError(err, "Failed to remove from wishlist.");
        fetchWishlist(); // rollback on failure
      }
    },
    [token, authApi, fetchWishlist]
  );

  const isInWishlist = useCallback(
    (productId) => wishlist.some((item) => item._id === productId),
    [wishlist]
  );

  // ================== CALCULATED VALUES ==================
  const subtotal = useMemo(
    () => cart.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [cart]
  );
  const totalItems = useMemo(
    () => cart.reduce((sum, i) => sum + i.quantity, 0),
    [cart]
  );
  const shipping = useMemo(() => (subtotal > 0 && subtotal < 1500 ? 49 : 0), [
    subtotal,
  ]);
  const tax = useMemo(() => subtotal * 0.18, [subtotal]);
  const total = useMemo(() => subtotal + shipping + tax, [
    subtotal,
    shipping,
    tax,
  ]);
  const isEmpty = useMemo(() => cart.length === 0, [cart]);
  const wishlistCount = useMemo(() => wishlist.length, [wishlist]);

  const value = useMemo(
    () => ({
      cart,
      wishlist,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      subtotal,
      shipping,
      tax,
      total,
      totalItems,
      isEmpty,
      wishlistCount,
      loading,
      error,
      refreshCart: fetchCart, // ✅ exposed
      refreshWishlist: fetchWishlist, // ✅ exposed
    }),
    [
      cart,
      wishlist,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      subtotal,
      shipping,
      tax,
      total,
      totalItems,
      isEmpty,
      wishlistCount,
      loading,
      error,
      fetchCart,
      fetchWishlist,
    ]
  );

  return (
    <CartWishlistContext.Provider value={value}>
      {children}
    </CartWishlistContext.Provider>
  );
}

export const useCartWishlist = () => {
  const context = useContext(CartWishlistContext);
  if (!context) {
    throw new Error(
      "useCartWishlist must be used within a CartWishlistProvider"
    );
  }
  return context;
};
