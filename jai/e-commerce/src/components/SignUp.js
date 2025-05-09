import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Auth.css";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons for password toggle

const BACKEND_URL = "http://localhost:8000"; // Backend API base URL

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // ✅ Function to validate password strength
  const isPasswordStrong = (password) => {
    return password.length >= 8 && /\d/.test(password) && /[A-Z]/.test(password);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); // Reset error message
    setLoading(true); // Show loading state

    // ✅ Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }

    // ✅ Check password strength
    if (!isPasswordStrong(password)) {
      setError("Password must be at least 8 characters long, include a number, and an uppercase letter.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/register/`, {
        username,
        email,
        password,
      });

      alert("Signup successful!");
      navigate("/signin"); // Redirect to Sign In page
    } catch (err) {
      console.error(err.response?.data || err.message);

      // ✅ Improved error message handling
      if (err.response) {
        setError(err.response.data.error || "Signup failed! Please try again.");
      } else {
        setError("Network error! Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Create an Account</h2>
        <p>Please enter your details</p>
        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={handleRegister}>
          {/* Username Input */}
          <label>Username</label>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          {/* Email Input */}
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

          {/* Confirm Password Input with Toggle */}
          <label>Confirm Password</label>
          <div className="password-input">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <span className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        <p>
          Already have an account?{" "}
          <span className="signin-link" onClick={() => navigate("/signin")}>
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
