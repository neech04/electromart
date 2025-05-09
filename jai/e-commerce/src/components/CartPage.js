import React, { useState } from "react";
import { useCart } from "./CartContext";
import axios from "axios";
import "../styles/CartPage.css";

const BACKEND_URL = "http://127.0.0.1:8000";

const CartPage = () => {
    const { cart, setCart, removeFromCart, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [customerAddress, setCustomerAddress] = useState("");

    const updateQuantity = (productId, quantity) => {
        setCart(cart.map(item => 
            item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
        ));
    };

    const totalPrice = cart.reduce((total, item) => 
        total + (Number(item.price) * (item.quantity || 1)), 0
    ).toFixed(2);

    const handlePlaceOrder = async () => {
        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        if (!customerEmail || !customerName || !customerAddress) {
            setError("Please fill in all required fields.");
            return;
        }

        if (!window.confirm("Are you sure you want to place the order?")) return;

        setLoading(true);
        setError("");

        const orderData = { 
            items: cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity || 1
            })),
            customer_email: customerEmail,
            customer_name: customerName,
            customer_address: customerAddress
        };

        try {
            const response = await axios.post(`${BACKEND_URL}/api/orders/create/`, orderData, {
                headers: { "Content-Type": "application/json" }
            });

            if (response.status === 201) {
                alert("Order placed successfully!");
                clearCart();
                setCustomerEmail("");
                setCustomerName("");
                setCustomerAddress("");
            } else {
                throw new Error(response.data?.error || "Failed to place order.");
            }
        } catch (error) {
            console.error("Order error:", error);
            setError(error.response?.data?.error || "Error placing order. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="cart-background">
            <div className="cart-container">
                <h2 className="cart-title">Shopping Cart</h2>
                <div className="cart-content">
                {cart.length === 0 ? (
                    <p className="empty-cart">Your cart is empty.</p>
                ) : (
                    <>
                        <div className="cart-items">
                            {cart.map((item) => (
                                <div key={item.id} className="cart-item">
                                    <img
                                        src={item.image?.startsWith("http") ? item.image : `${BACKEND_URL}/media/${item.image}`}
                                        alt={item.name}
                                        className="cart-image"
                                        onError={(e) => { e.target.src = `${BACKEND_URL}/media/default-image.jpg`; }}
                                    />
                                    <div className="cart-details">
                                        <h3 className="cart-item-title">{item.name}</h3>
                                        <p className="cart-price">₹{Number(item.price).toFixed(2)}</p>

                                        <div className="quantity-controls">
                                            <button
                                                className="decrease-btn"
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                            >
                                                -
                                            </button>
                                            <span className="quantity">{item.quantity || 1}</span>
                                            <button
                                                className="increase-btn"
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            >
                                                +
                                            </button>
                                        </div>

                                        <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="customer-info-section">
                            <h3>Your Information</h3>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Shipping Address</label>
                                <textarea
                                    value={customerAddress}
                                    onChange={(e) => setCustomerAddress(e.target.value)}
                                    placeholder="Enter your full shipping address"
                                    rows="4"
                                    required
                                />
                            </div>
                        </div>

                        <div className="cart-summary">
                            <h3>Order Summary</h3>
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>₹{totalPrice}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>
                            <div className="summary-row total">
                                <span>Total</span>
                                <span>₹{totalPrice}</span>
                            </div>
                            
                            {error && <p className="error-message">{error}</p>}
                            
                            <button
                                className="place-order-btn"
                                onClick={handlePlaceOrder}
                                disabled={loading || !customerEmail || !customerName || !customerAddress}
                            >
                                {loading ? "Processing..." : "Place Order"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
        </div>
    );
};

export default CartPage;