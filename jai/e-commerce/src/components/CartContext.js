import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        // Load cart from localStorage on initialization
        const savedCart = localStorage.getItem("cart");
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product, quantity = 1) => {
        setCart((prevCart) => {
            const existingIndex = prevCart.findIndex(item => item.id === product.id);
            if (existingIndex !== -1) {
                const updatedCart = [...prevCart];
                updatedCart[existingIndex].quantity += quantity;
                alert(`${product.name} quantity updated to ${updatedCart[existingIndex].quantity}`); // Alert for updated quantity
                return updatedCart;
            } else {
                alert(`${product.name} added to cart!`); // Alert for new item added
                return [...prevCart, { ...product, quantity }];
            }
        });
    };

    const removeFromCart = (productId) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== productId)); // Completely remove the item
    };

    const clearCart = () => {
        setCart([]);
    };

    return (
        <CartContext.Provider value={{ cart, setCart, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);