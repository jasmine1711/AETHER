import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Login.css"; // Ensure this path is correct

const Login = () => {
  const { login, error: authError, clearError } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ login: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (localError) setLocalError("");
    if (authError) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { login: loginValue, password } = formData;

    if (!loginValue || !password) {
      setLocalError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setLocalError("");

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isEmail = emailRegex.test(loginValue);

      // ✅ **THE FIX**: Force email to lowercase before sending to ensure consistency
      const finalLoginValue = isEmail ? loginValue.toLowerCase() : loginValue;

      const payload = {
        login: finalLoginValue,
        password: password,
      };

      console.log("🔑 Sending final login request:", payload);

      const result = await login(payload);
      console.log("✅ Login result:", result);

      if (result.success) {
        navigate("/");
      } else {
        setLocalError(result.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      setLocalError("Unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left-panel">
        <div className="brand-message">
          <h2>
            Welcome Back to <span className="brand-name">ÆTHER</span>
          </h2>
          <p>Sign in to explore the latest collections and styles!</p>
        </div>
      </div>
      <div className="login-right-panel">
        <div className="login-form-container">
          <div className="form-header">
            <h2>Sign In</h2>
            <p>Enter your credentials to access your account</p>
          </div>
          {(localError || authError) && (
            <div className="login-error">{localError || authError}</div>
          )}
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="login">Email or Username</label>
              <input
                id="login"
                type="text"
                name="login"
                placeholder="Enter your email or username"
                value={formData.login}
                onChange={handleChange}
                className="login-input"
                required
                autoComplete="off"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-container">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="login-input"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="show-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <div className="login-footer">
            <p>
              Don't have an account?{" "}
              <Link to="/signup" className="signup-link">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

