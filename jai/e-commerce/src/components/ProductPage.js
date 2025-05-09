import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCart } from "../components/CartContext";
import "../styles/ProductPage.css";

const BACKEND_URL = "http://127.0.0.1:8000";

const ProductPage = () => {
    const { id } = useParams();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = localStorage.getItem("token"); // ✅ Correct


    useEffect(() => {
        let isMounted = true;


const fetchProduct = async () => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/products/${id}/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: token ? `Bearer ${token}` : "", // Ensure token is included
            },
        });

        if (!response.ok) {
            if (response.status === 401) throw new Error("Unauthorized! Please log in.");
            throw new Error(`Failed to fetch product. Status: ${response.status}`);
        }

        const data = await response.json();
        setProduct(data);
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
};


        fetchProduct();
        return () => { isMounted = false; };
    }, [id, token]); // ✅ Dependency on token

    if (loading) return <p className="loading-message">🔄 Loading product details...</p>;
    if (error) return <p className="error-message">❌ {error}</p>;
    if (!product) return <p className="error-message">⚠️ Product not found.</p>;

    return (
        <div className="product-container">
            <h2 className="product-title">{product.name}</h2>

            <img 
                src={product.image ? `${BACKEND_URL}/media/${product.image}` : `${BACKEND_URL}/media/default-product.jpg`}
                alt={product.name} 
                className="product-image" 
                onError={(e) => e.target.src = `${BACKEND_URL}/media/default-product.jpg`} 
            />

            <p className="product-description">{product.description || "No description available."}</p>
            
            <p className="price">
                ₹{new Intl.NumberFormat("en-IN").format(product.price)}
                <span className="mrp"> M.R.P: <del>₹{new Intl.NumberFormat("en-IN").format(Math.round(product.price * 1.2))}</del></span>
                <span className="discount"> (20% off)</span>
            </p>

            <button className="add-to-cart" onClick={() => addToCart(product)}>🛒 Add to Cart</button>
        </div>
    );
};

export default ProductPage;
