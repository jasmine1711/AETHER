// src/context/PaymentContext.jsx
import { createContext, useContext, useState, useCallback } from "react";
import api from "../utils/api";  // ✅ Import your configured api instance

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
      // ✅ Use api instance instead of fetch
      const { data } = await api.get("/payments/test");
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
      const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const shippingFee = subtotal > 0 ? 99 : 0;
      const total = subtotal + shippingFee;

      // ✅ Use api instance
      const { data } = await api.post("/payments/razorpay/order", {
        items: cart.map((i) => ({
          product: i._id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          size: i.size,
          image: i.image,
        })),
        shipping: shippingInfo,
        subtotal,
        shippingFee,
        total,
      });

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
      // ✅ Use api instance
      const { data } = await api.post("/payments/razorpay/verify", {
        ...razorpayData,
        orderId,
      });

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

  // Fetch payment methods
  const getPaymentMethods = async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ Use api instance
      const { data } = await api.get("/payments/methods");
      return { success: true, data };
    } catch (err) {
      console.error("❌ Get Payment Methods Error:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Get payment history
  const getPaymentHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ Use api instance
      const { data } = await api.get("/payments/my-orders");
      return { success: true, data };
    } catch (err) {
      console.error("❌ Get Payment History Error:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Utility functions (no changes needed)
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