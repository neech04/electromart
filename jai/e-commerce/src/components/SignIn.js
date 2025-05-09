import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Auth.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const BACKEND_URL = "http://localhost:8000"; // Backend API base URL

const SignIn = ({ onLogin }) => {
  const [identifier, setIdentifier] = useState(""); // Can be username or email
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Password visibility toggle
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setLoading(true); // Show loading state

    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/login/`, { identifier, password });

      if (response.status === 200) {
        console.log("Login Successful:", response.data);
        alert("Login successful!");

        // Store user session securely
        sessionStorage.setItem("user", JSON.stringify(response.data.user));

        // Call the onLogin callback to update the Navbar
        if (onLogin) {
          onLogin();
        }

        navigate("/"); // Redirect to home page after login
      }
    } catch (error) {
      console.error("Login Error:", error.response?.data || error.message);

      // Handle different types of errors
      if (!error.response) {
        setError("Network error. Please check your connection.");
      } else if (error.response.status === 401) {
        setError("Invalid username/email or password.");
      } else {
        setError(error.response.data?.error || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Welcome Back</h2>
        <p>Please enter your details</p>

        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={handleLogin}>
          {/* Identifier (Username/Email) Input */}
          <label>Username or Email</label>
          <input
            type="text"
            placeholder="Enter your username or email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />

          {/* Password Input with Toggle */}
          <label>Password</label>
          <div className="password-input">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p>
          Don’t have an account?{" "}
          <span className="signup-link" onClick={() => navigate("/signup")}>
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignIn;