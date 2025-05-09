import React, { useEffect, useState } from "react";
import axios from "axios";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../styles/HomePage.css";

const BACKEND_URL = "http://127.0.0.1:8000"; // Change this to your actual backend URL

function HomePage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch products from the backend
    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${BACKEND_URL}/api/products/`);
            console.log("Fetched Products:", response.data); // Debugging
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products:", error);
            setError("Failed to fetch products. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Organizing products by category
    const groupedProducts = products.reduce((acc, product) => {
        if (!acc[product.category]) acc[product.category] = [];
        acc[product.category].push(product);
        return acc;
    }, {});

    // Slider settings
    const sliderSettings = {
        dots: true,
        infinite: false, // Prevent looping if fewer items
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        responsive: [
            { breakpoint: 1024, settings: { slidesToShow: 3 } },
            { breakpoint: 768, settings: { slidesToShow: 2 } },
            { breakpoint: 480, settings: { slidesToShow: 1 } },
        ],
    };

    if (loading) {
        return <p className="loading-message">Loading products...</p>;
    }

    if (error) {
        return (
            <div className="error-message">
                <p>{error}</p>
                <button onClick={fetchProducts} className="retry-button">
                    Retry
                </button>
            </div>
        );
    }

    if (Object.keys(groupedProducts).length === 0) {
        return <p>No products available</p>;
    }

    return (
        <div className="homepage-container">
            <h2 className="page-title">Welcome </h2>

            {Object.keys(groupedProducts).map((category) => (
                <div key={category} className="category-section">
                    <div className="category-header">
                        <h3 className="category-title">{category}</h3>
                        <Link to={`/category/${category}`} className="view-all-button">
                            View All
                        </Link>
                    </div>
                    <Slider {...sliderSettings}>
                        {groupedProducts[category].map((product) => (
                            <div key={product.id} className="product-card">
                                <Link to={`/product/${product.id}`} className="product-link">
                                    <img
                                        src={
                                            product.image?.startsWith("http")
                                                ? product.image
                                                : `${BACKEND_URL}/media/${product.image}`
                                        }
                                        alt={product.name}
                                        className="product-image"
                                        onError={(e) => {
                                            e.target.src = `${BACKEND_URL}/media/default-image.jpg`;
                                        }}
                                    />
                                    <h4 className="product-name">{product.name}</h4>
                                    <p className="product-price">₹{Number(product.price).toFixed(2)}</p>
                                </Link>
                            </div>
                        ))}
                    </Slider>
                </div>
            ))}
        </div>
    );
}

export default HomePage;