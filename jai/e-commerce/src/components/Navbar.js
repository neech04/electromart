import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import logo from "../assets/logo.png";
import { FaSearch, FaUser, FaShoppingCart, FaBars, FaTimes, FaSignOutAlt } from "react-icons/fa";

const Navbar = ({ isLoggedIn, onLogin, onLogout }) => {
    const [dropdown, setDropdown] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    // Check if Admin is Logged In
    const isAdminLoggedIn = sessionStorage.getItem("adminToken") !== null;

    // Retrieve username from sessionStorage
    const username = sessionStorage.getItem("username") || "Guest";
    console.log("Retrieved username:", username); // Debugging log

    // Toggle Dropdown
    const toggleDropdown = (menu) => {
        setDropdown((prev) => (prev === menu ? null : menu));
        
    };

    // Toggle Mobile Menu
    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
        setDropdown(null); // Close dropdowns when menu toggles
    };

    // Handle Logout for both User and Admin
    const handleLogout = () => {
        sessionStorage.removeItem("user"); // Remove user session
        sessionStorage.removeItem("adminToken"); // Remove admin session
        sessionStorage.removeItem("username"); // Remove username
        onLogout(); // Call the onLogout callback to update the UI
        navigate("/"); // Redirect to home page
    };

    // Handle search submit (either button click or Enter key)
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim() !== "") {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <nav className="navbar">
            {/* Logo and Brand Name */}
            <div className="logo-container">
                <Link to="/">
                    <img src={logo} alt="ElectroMart Logo" className="logo" />
                </Link>
                <span className="brand-name">ElectroMart</span>
                <span className="welcome-message">
                    {isLoggedIn || isAdminLoggedIn ? `Welcome, ${username}` : "Welcome's You!"}
                </span>
            </div>

            {/* Search Bar */}
            <form className="search-bar" onSubmit={handleSearchSubmit}>
                <input
                    type="text"
                    placeholder="Search for Products, Brands and More"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="search-button" type="submit">
                    <FaSearch />
                </button>
            </form>

            {/* Mobile Menu Icon */}
            <div className="menu-icon" onClick={toggleMenu}>
                {menuOpen ? <FaTimes /> : <FaBars />}
            </div>

            {/* Navigation Links */}
            <div className={`nav-links ${menuOpen ? "show" : ""}`}>
                {/* Products Dropdown */}
                <div
                    className="dropdown-container"
                    onMouseEnter={() => toggleDropdown("products")}
                    onMouseLeave={() => setDropdown(null)}
                >
                    <span className="dropdown-toggle">Products ▾</span>
                    <div className={`dropdown-menu ${dropdown === "products" ? "active" : ""}`}>
                        <Link to="/category/phone">📱 Phones</Link>
                        <Link to="/category/laptop">💻 Laptops</Link>
                        <Link to="/category/tablet">📟 Tablets</Link>
                        <Link to="/category/accessory">🎧 Accessories</Link>
                    </div>
                </div>

                {/* Cart Link */}
                <Link to="/cart" className="cart-link">
                    <FaShoppingCart /> Cart
                </Link>

                {/* Login Dropdown or Logout Button */}
                {isLoggedIn || isAdminLoggedIn ? (
                    // Logout Button (Visible for both User and Admin)
                    <button className="logout-btn" onClick={handleLogout}>
                        <FaSignOutAlt /> Logout
                    </button>
                ) : (
                    // Login Dropdown
                    <div
                        className="dropdown-container"
                        onMouseEnter={() => toggleDropdown("login")}
                        onMouseLeave={() => setDropdown(null)}
                    >
                        <button className="login-btn">
                            <FaUser /> Login ▾
                        </button>
                        <div className={`dropdown-menu login-dropdown ${dropdown === "login" ? "active" : ""}`}>
                            <Link to="/SignIn">👤 User Login</Link>
                            <Link to="/AdminLogin">🛠 Admin Login</Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;