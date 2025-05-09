import React, { useState } from "react"; // Keep this import
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import ProductPage from "./components/ProductPage";
import CartPage from "./components/CartPage";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import { CartProvider } from "./components/CartContext"; // Ensure global cart state
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import CategoryPage from "./components/CategoryPage";
import SearchResults from "./components/SearchResults";
function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state globally

    // Callback function to update login state after successful login
    const handleLogin = () => {
        setIsLoggedIn(true);
    };

    // Callback function to handle logout
    const handleLogout = () => {
        setIsLoggedIn(false); // Update login state
        sessionStorage.removeItem("user"); // Clear user session
    };

    return (
        <Router>
            <CartProvider> {/* Cart Provider wraps entire app to manage state globally */}
                <Navbar isLoggedIn={isLoggedIn} onLogin={handleLogin} onLogout={handleLogout} /> {/* Navbar remains outside Routes for persistent display */}
                <Routes>
                    <Route path="/" element={<HomePage />} /> {/* Home Route */}
                    <Route path="/category/:category" element={<CategoryPage />} /> {/* Dynamic category page */}
                    <Route path="/cart" element={<CartPage />} /> {/* Shopping Cart Page */}
                    <Route path="/SignIn" element={<SignIn onLogin={handleLogin} />} />
                    <Route path="/signup" element={<SignUp />} /> {/* Sign Up Page */}
                    <Route path="/adminlogin" element={<AdminLogin onLogin={handleLogin}/>} />
                    <Route path="/admindashboard" element={<AdminDashboard />} />
                    <Route path="/product/:id" element={<ProductPage />} />
                    <Route path="/product/:id" element={<ProductPage />} />
                    <Route path="/search" element={<SearchResults />} />
                </Routes>
            </CartProvider>
        </Router>
    );
}

export default App;