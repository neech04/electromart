import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Auth.css";

const BACKEND_URL = "http://127.0.0.1:8000/api";

function AdminDashboard() {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [newProduct, setNewProduct] = useState({ 
        name: "", 
        price: "", 
        image: "", 
        category: "" 
    });
    const [updatedProducts, setUpdatedProducts] = useState({});
    const [categories, setCategories] = useState(["laptop", "phone", "tablet", "accessories"]);
    const [loading, setLoading] = useState({
        products: false,
        orders: false,
        actions: false
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const orderStatusOptions = ["Pending", "Shipped", "Delivered"];

    useEffect(() => {
        fetchProducts();
        fetchOrders();
    }, []);

    const fetchProducts = async () => {
        setLoading(prev => ({...prev, products: true}));
        setError("");
        try {
            const response = await axios.get(`${BACKEND_URL}/products/`);
            setProducts(response.data || []);
        } catch (error) {
            console.error("Error fetching products:", error);
            setError("Failed to fetch products. Please try again.");
        } finally {
            setLoading(prev => ({...prev, products: false}));
        }
    };

    const fetchOrders = async () => {
        setLoading(prev => ({...prev, orders: true}));
        setError("");
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${BACKEND_URL}/admin/orders/`, {
                headers: {
                    'Authorization': `Token ${token}`
                }
            });
            
            // Handle both array and object response formats
            const ordersData = Array.isArray(response.data) ? 
                response.data : 
                response.data?.orders || [];
            
            setOrders(ordersData);
        } catch (error) {
            console.error("Error fetching orders:", error.response?.data || error.message);
            setError(error.response?.data?.message || "Failed to fetch orders. Please try again.");
            setOrders([]);
        } finally {
            setLoading(prev => ({...prev, orders: false}));
        }
    };

    const handleAddProduct = async () => {
        if (!newProduct.name || !newProduct.price || !newProduct.category) {
            setError("Please fill in all fields.");
            return;
        }

        setLoading(prev => ({...prev, actions: true}));
        setError("");
        setSuccess("");
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${BACKEND_URL}/admin/products/add/`, newProduct, {
                headers: {
                    'Authorization': `Token ${token}`
                }
            });
            setSuccess("Product added successfully!");
            fetchProducts();
            setNewProduct({ name: "", price: "", image: "", category: "" });
        } catch (error) {
            console.error("Error adding product:", error);
            setError("Failed to add product. Please try again.");
        } finally {
            setLoading(prev => ({...prev, actions: false}));
        }
    };

    const handleUpdateProduct = async (id) => {
        if (!updatedProducts[id]) return;
    
        setLoading(prev => ({...prev, actions: true}));
        setError("");
        setSuccess("");
    
        const updatedData = {
            ...updatedProducts[id],
            price: parseFloat(updatedProducts[id].price),
        };
    
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${BACKEND_URL}/admin/products/update/${id}/`, updatedData, {
                headers: {
                    'Authorization': `Token ${token}`
                }
            });
            setSuccess("Product updated successfully!");
            fetchProducts();
        } catch (error) {
            console.error("Error updating product:", error);
            setError("Failed to update product. Please try again.");
        } finally {
            setLoading(prev => ({...prev, actions: false}));
        }
    };

    const handleDeleteProduct = async (id) => {
        setLoading(prev => ({...prev, actions: true}));
        setError("");
        setSuccess("");
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${BACKEND_URL}/admin/products/delete/${id}/`, {
                headers: {
                    'Authorization': `Token ${token}`
                }
            });
            setSuccess("Product deleted successfully!");
            fetchProducts();
        } catch (error) {
            console.error("Error deleting product:", error);
            setError("Failed to delete product. Please try again.");
        } finally {
            setLoading(prev => ({...prev, actions: false}));
        }
    };

    const handleUpdateOrderStatus = async (orderId, status) => {
        setLoading(prev => ({...prev, actions: true}));
        setError("");
        setSuccess("");
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${BACKEND_URL}/admin/orders/update/${orderId}/`, 
                { status },
                {
                    headers: {
                        'Authorization': `Token ${token}`
                    }
                }
            );
            setSuccess("Order status updated successfully!");
            fetchOrders();
        } catch (error) {
            console.error("Error updating order status:", error.response?.data || error.message);
            setError(error.response?.data?.message || "Failed to update order status.");
        } finally {
            setLoading(prev => ({...prev, actions: false}));
        }
    };

    return (
        <div className="admin-dashboard">
            <h2>Admin Dashboard</h2>

            {success && <div className="alert success">{success}</div>}
            {error && <div className="alert error">{error}</div>}

            <div className="dashboard-sections">
                {/* Add Product Section */}
                <div className="section">
                    <h3>Add New Product</h3>
                    <div className="form-group">
                        <input 
                            type="text" 
                            placeholder="Product Name" 
                            value={newProduct.name} 
                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} 
                        />
                    </div>
                    <div className="form-group">
                        <input 
                            type="number" 
                            placeholder="Price" 
                            value={newProduct.price} 
                            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} 
                        />
                    </div>
                    <div className="form-group">
                        <input 
                            type="text" 
                            placeholder="Image URL" 
                            value={newProduct.image} 
                            onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })} 
                        />
                    </div>
                    <div className="form-group">
                        <select 
                            value={newProduct.category} 
                            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        >
                            <option value="">Select Category</option>
                            {categories.map((category) => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                    <button 
                        onClick={handleAddProduct} 
                        disabled={loading.actions}
                        className="btn primary"
                    >
                        {loading.actions ? "Adding..." : "Add Product"}
                    </button>
                </div>

                {/* Product Management Section */}
                <div className="section">
                    <h3>Manage Products</h3>
                    {loading.products ? (
                        <div className="loading">Loading products...</div>
                    ) : (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Price</th>
                                        <th>Category</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.length > 0 ? (
                                        products.map((product) => (
                                            <tr key={product.id}>
                                                <td>
                                                    <input 
                                                        type="text" 
                                                        defaultValue={product.name} 
                                                        onChange={(e) => setUpdatedProducts((prev) => ({ 
                                                            ...prev, 
                                                            [product.id]: { ...product, name: e.target.value } 
                                                        }))} 
                                                    />
                                                </td>
                                                <td>
                                                    <input 
                                                        type="text" 
                                                        defaultValue={product.price} 
                                                        onChange={(e) => setUpdatedProducts((prev) => ({ 
                                                            ...prev, 
                                                            [product.id]: { ...product, price: e.target.value } 
                                                        }))} 
                                                    />
                                                </td>
                                                <td>
                                                    <select 
                                                        defaultValue={product.category} 
                                                        onChange={(e) => setUpdatedProducts((prev) => ({ 
                                                            ...prev, 
                                                            [product.id]: { ...product, category: e.target.value } 
                                                        }))}
                                                    >
                                                        {categories.map((category) => (
                                                            <option key={category} value={category}>{category}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="actions">
                                                    <button 
                                                        onClick={() => handleUpdateProduct(product.id)} 
                                                        disabled={loading.actions}
                                                        className="btn secondary"
                                                    >
                                                        Update
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteProduct(product.id)} 
                                                        disabled={loading.actions}
                                                        className="btn danger"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4">No products found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Order Management Section */}
                <div className="section">
                    <h3>Customer Orders</h3>
                    {loading.orders ? (
                        <div className="loading">Loading orders...</div>
                    ) : orders.length > 0 ? (
                        <div className="table-container">
                            <table className="orders-table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Email</th>
                                        <th>Address</th>
                                        <th>Items</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.id}>
                                            <td>#{order.id}</td>
                                            <td>{order.customer_name || 'Guest'}</td>
                                            <td>{order.customer_email}</td>
                                            <td className="address-cell">
                                                {order.customer_address || 'Not provided'}
                                            </td>
                                            <td>
                                                <ul className="order-items">
                                                    {order.items?.map((item, index) => (
                                                        <li key={index}>
                                                            {item.product_name} (x{item.quantity}) - ₹{item.price}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </td>
                                            <td>₹{order.total_price}</td>
                                            <td>
                                                <select 
                                                    value={order.status}
                                                    onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                                    disabled={loading.actions}
                                                >
                                                    {orderStatusOptions.map(status => (
                                                        <option key={status} value={status}>{status}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <button 
                                                    onClick={() => handleUpdateOrderStatus(order.id, order.status)}
                                                    disabled={loading.actions}
                                                    className="btn secondary"
                                                >
                                                    {loading.actions ? "Updating..." : "Update"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="no-orders">
                            <p>No orders found</p>
                            <button 
                                onClick={fetchOrders} 
                                disabled={loading.orders}
                                className="btn primary"
                            >
                                {loading.orders ? "Refreshing..." : "Refresh Orders"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;