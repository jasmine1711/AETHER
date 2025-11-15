// src/pages/Checkout.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartWishlist } from "../context/CartWishlistContext";
import { useAuth } from "../context/AuthContext";

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, subtotal, shipping, tax, total, clearCart } = useCartWishlist();
  const { token, user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    email: "", phone: "", address: "", city: "", state: "", pincode: "",
  });

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  const razorpayKey = process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_test_RCEnwnWpu5qWI7";

  // Prefill email if logged in
  useEffect(() => {
    if (token && user?.email) {
      setCustomerInfo(prev => ({ ...prev, email: user.email }));
    }
  }, [token, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo({ ...customerInfo, [name]: value });
  };

  const pay = async () => {
    if (!customerInfo.email || !customerInfo.address) {
      return setError("Email & address are required.");
    }
    if (!cart.length) return setError("Your cart is empty.");

    setLoading(true);
    setError(null);

    try {
      if (!window.Razorpay) throw new Error("Razorpay not loaded. Refresh page.");

      const orderPayload = {
        items: cart.map(i => ({
          product: i._id || i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity, // ✅ This is correct from our previous fix
          size: i.size || "",
          image: i.thumbnail || ""
        })),
        shipping: { ...customerInfo },
        subtotal, shippingFee: shipping, tax, total
      };

      const headers = { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) };

      const orderRes = await fetch(`${API_URL}/payments/razorpay/order`, {
        method: "POST",
        headers,
        body: JSON.stringify(orderPayload),
      });

      if (!orderRes.ok) {
        const errorData = await orderRes.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create order.");
      }

      const { razorpayOrder, dbOrder, key } = await orderRes.json();

      const options = {
        key: key || razorpayKey,
        amount: razorpayOrder.amount,
        currency: "INR",
        name: "AETHER",
        description: "Order Payment",
        order_id: razorpayOrder.id,
        prefill: { email: customerInfo.email, contact: customerInfo.phone },
        theme: { color: "#F49AC2" },
        modal: { ondismiss: () => setLoading(false) },
        handler: async (response) => {
          try {
            const verifyRes = await fetch(`${API_URL}/payments/razorpay/verify`, {
              method: "POST",
              headers,
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                dbOrderId: dbOrder._id,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              alert("Payment successful! 🎉");
              clearCart();
              navigate("/orders");
            } else setError("Payment verification failed. Contact support.");
          } catch {
            setError("Payment verification error. Contact support.");
          } finally {
            setLoading(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", e => {
        setError(`Payment failed: ${e.error.description}`);
        setLoading(false);
      });
      rzp.open();

    } catch (err) {
      console.error(err);
      setError(err?.message || "Something went wrong. Try again.");
      setLoading(false);
    }
  };

  // ----- ✨ NEW: HANDLE COD ORDER -----
  const handleCOD = async () => {
    if (!customerInfo.email || !customerInfo.address) {
      return setError("Email & address are required.");
    }
    if (!cart.length) return setError("Your cart is empty.");

    setLoading(true);
    setError(null);

    try {
      const orderPayload = {
        items: cart.map(i => ({
          product: i._id || i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          size: i.size || "",
          image: i.thumbnail || ""
        })),
        shipping: { ...customerInfo },
        subtotal, shippingFee: shipping, tax, total
      };

      const headers = { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) };

      // Note the NEW URL: /cod/order
      const codRes = await fetch(`${API_URL}/payments/cod/order`, {
        method: "POST",
        headers,
        body: JSON.stringify(orderPayload),
      });

      if (!codRes.ok) {
        const errorData = await codRes.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create COD order.");
      }
      
      // If successful:
      alert("Order placed successfully with COD! 🎉");
      clearCart();
      navigate("/orders"); // Or to a 'Thank You' page

    } catch (err) {
      console.error(err);
      setError(err?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };
  // ----- END NEW COD FUNCTION -----

  if (loading) return (
    <div className="max-w-2xl mx-auto p-6 text-center py-8">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      <p className="mt-2">Preparing payment...</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Customer Info */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
          <div className="space-y-4">
            <input type="email" name="email" placeholder="Email *" value={customerInfo.email} onChange={handleInputChange} className="w-full p-2 border rounded"/>
            <input type="tel" name="phone" placeholder="Phone" value={customerInfo.phone} onChange={handleInputChange} className="w-full p-2 border rounded"/>
            <textarea name="address" placeholder="Address *" value={customerInfo.address} onChange={handleInputChange} rows={3} className="w-full p-2 border rounded"/>
            <input name="city" placeholder="City" value={customerInfo.city} onChange={handleInputChange} className="w-full p-2 border rounded"/>
            <input name="state" placeholder="State" value={customerInfo.state} onChange={handleInputChange} className="w-full p-2 border rounded"/>
            <input name="pincode" placeholder="Pincode" value={customerInfo.pincode} onChange={handleInputChange} className="w-full p-2 border rounded"/>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="border rounded-lg p-4 bg-gray-50">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between mb-2 text-sm">
                <span>{item.name} ({item.size}) × {item.quantity}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
            <div className="border-t pt-3 mt-3 space-y-2">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>₹{shipping}</span></div>
              <div className="flex justify-between"><span>Tax (18%)</span><span>₹{tax.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
            </div>

            <button onClick={pay} disabled={loading || total === 0 || !customerInfo.email || !customerInfo.address} className="mt-6 w-full bg-indigo-600 text-white py-3 rounded font-medium hover:bg-indigo-700 disabled:opacity-50">
              {loading ? "Processing..." : `Pay ₹${total.toFixed(2)} with Razorpay`}
            </button>
            
            {/* ----- ✨ NEW: COD BUTTON ----- */}
            <button onClick={handleCOD} disabled={loading || total === 0 || !customerInfo.email || !customerInfo.address} className="mt-4 w-full bg-gray-600 text-white py-3 rounded font-medium hover:bg-gray-700 disabled:opacity-50">
              {loading ? "Processing..." : "Pay with Cash on Delivery"}
            </button>
            {/* ----- END NEW COD BUTTON ----- */}

            <p className="text-xs text-gray-500 mt-3 text-center">Your payment is securely processed</p>
          </div>
        </div>
      </div>
    </div>
  );
}