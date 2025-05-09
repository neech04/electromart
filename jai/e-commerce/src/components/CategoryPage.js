import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/CategoryPage.css"

const BACKEND_URL = "http://127.0.0.1:8000";

const CategoryPage = () => {
    const { category } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`${BACKEND_URL}/api/products/category/${category}/`); // ✅ Fetch products by category

                if (!response.ok) {
                    throw new Error(`Failed to fetch products. Status: ${response.status}`);
                }

                const data = await response.json();
                setProducts(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [category]);

    return (
        <div className="category-container">
            <h2>{category.charAt(0).toUpperCase() + category.slice(1)} Products</h2>

            {loading && <p>Loading products...</p>}
            {error && <p className="error-message">{error}</p>}

            <div className="product-list">
                {!loading && !error && products.length > 0 ? (
                    products.map((product) => (
                        <div key={product.id} className="product-card">
                            <a href={`/product/${product.id}`}>
                                <img src={`${BACKEND_URL}/media/${product.image}`} alt={product.name} />
                                <h3>{product.name}</h3>
                                <p>₹{product.price}</p>
                            </a>
                        </div>
                    ))
                ) : (
                    !loading && !error && <p>No products available in this category.</p>
                )}
            </div>
        </div>
    );
};

export default CategoryPage;
