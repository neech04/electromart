import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import "../styles/SearchResults.css";

const BACKEND_URL = "http://127.0.0.1:8000";

const SearchResults = () => {
    const location = useLocation();
    const query = new URLSearchParams(location.search).get("q")?.toLowerCase() || "";
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${BACKEND_URL}/api/products/`);
                const data = await response.json();
                setProducts(data);
                setFilteredProducts(
                    data.filter((product) =>
                        product.name.toLowerCase().includes(query)
                    )
                );
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [query]);

    if (loading) return <p className="loading-message">🔍 Searching for products...</p>;

    return (
        <div className="search-results-container">
            <h2>Search Results for: <span>"{query}"</span></h2>

            {filteredProducts.length === 0 ? (
                <p className="no-results">No matching products found.</p>
            ) : (
                <div className="product-grid">
                    {filteredProducts.map((product) => (
                        <Link
                            to={`/product/${product.id}`}
                            key={product.id}
                            className="product-card"
                        >
                            <img
                                src={
                                    product.image
                                        ? `${BACKEND_URL}/${product.image}`
                                        :` ${BACKEND_URL}/media/default-product.jpg`
                                }
                                alt={product.name}
                                onError={(e) => {
                                    e.target.src = `${BACKEND_URL}/media/default-product.jpg`;
                                }}
                            />
                            <h3>{product.name}</h3>
                            <p>₹{new Intl.NumberFormat("en-IN").format(product.price)}</p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchResults;