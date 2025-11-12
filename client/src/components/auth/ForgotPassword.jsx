import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Changed from AppContext to AuthContext
import "./Auth.css";

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) return setError("Please enter your email");
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const result = await forgotPassword(email);
      setIsLoading(false);

      if (result.success) {
        setMessage(result.message || "📩 Check your email for reset instructions");
        setEmail("");
        // Optional: redirect to login after a few seconds
        setTimeout(() => navigate("/login"), 5000);
      } else {
        setError(result.message || "❌ Something went wrong. Please try again.");
      }
    } catch (err) {
      setIsLoading(false);
      setError("⚠️ Server error. Please try again later.");
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2>🔑 Forgot Password</h2>

        {error && <p className="auth-error">{error}</p>}
        {message && <p className="auth-success">{message}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your registered email"
              disabled={isLoading}
            />
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? "⏳ Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="links mt-4">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;