import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Admin.css";

function AdminLogin() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/api/admin/login/",
                { username, password },
                { headers: { "Content-Type": "application/json" } }
            );

            if (response.status === 200) {
                sessionStorage.setItem("adminToken", response.data.token);
                sessionStorage.setItem("adminUsername", username);
                navigate("/admindashboard");
            }
        } catch (error) {
            if (error.response?.status === 401) {
                setError("Invalid username or password.");
            } else {
                setError(error.response?.data?.error || "Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-container">
            <div className="admin-login">
                <h2>Admin Login</h2>
                {error && <p className="error">{error}</p>}
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" disabled={loading} className={loading ? "disabled" : ""}>
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AdminLogin;