// src/context/PaymentContext.jsx
import { createContext, useContext, useState, useCallback } from "react";

const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentIntent, setPaymentIntent] = useState(null);

  const clearError = useCallback(() => setError(null), []);

  // Test API connection
  const testPayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:5000/api/payments/test");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      console.log("✅ Payment API Response:", data);
      return { success: true, data };
    } catch (err) {
      console.error("❌ Payment API Error:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Create Razorpay Payment Intent
  const createPaymentIntent = async (cart, shippingInfo) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
      const shippingFee = subtotal > 0 ? 99 : 0;
      const total = subtotal + shippingFee;

      const res = await fetch("http://localhost:5000/api/payments/razorpay/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          items: cart.map((i) => ({
            product: i._id,
            name: i.name,
            price: i.price,
            quantity: i.qty,
            size: i.size,
            image: i.image,
          })),
          shipping: shippingInfo,
          subtotal,
          shippingFee,
          total,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create Razorpay order");
      }

      const data = await res.json();
      setPaymentIntent(data);
      return { success: true, data };
    } catch (err) {
      console.error("❌ Create Razorpay Order Error:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Confirm payment (via Razorpay verification)
  const confirmPayment = async (orderId, razorpayData) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/payments/razorpay/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ ...razorpayData, orderId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setPaymentIntent(null);
      return { success: true, data };
    } catch (err) {
      console.error("❌ Confirm Payment Error:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Fetch payment methods (optional for Razorpay)
  const getPaymentMethods = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:5000/api/payments/methods", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      return { success: true, data };
    } catch (err) {
      console.error("❌ Get Payment Methods Error:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Get payment history (user orders)
  const getPaymentHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:5000/api/payments/my-orders", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      return { success: true, data };
    } catch (err) {
      console.error("❌ Get Payment History Error:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // --- Utility Functions ---
  const formatCurrency = (amount, currency = "INR") =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount);

  const validateCardNumber = (cardNumber) => /^\d{13,19}$/.test(cardNumber.replace(/[\s-]/g, ""));
  const validateExpiryDate = (month, year) => {
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    return !(year < currentYear || (year === currentYear && month < currentMonth) || month < 1 || month > 12);
  };
  const validateCVV = (cvv) => /^\d{3,4}$/.test(cvv);
  const validateMobileNumber = (number) => /^[6-9]\d{9}$/.test(number);

  return (
    <PaymentContext.Provider
      value={{
        loading,
        error,
        paymentIntent,
        testPayment,
        createPaymentIntent,
        confirmPayment,
        getPaymentMethods,
        getPaymentHistory,
        clearError,
        formatCurrency,
        validateCardNumber,
        validateExpiryDate,
        validateCVV,
        validateMobileNumber,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) throw new Error("usePayment must be used within a PaymentProvider");
  return context;
};
