import { useState } from "react";
import axios from "axios";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Both fields are required.");
            return;
        }

        try {
            const response = await axios.post("http://localhost:5000/api/login", {
                email,
                password,
            }, {
                withCredentials: true
            });

            if (response.status === 200) {
                localStorage.setItem("userEmail", email);
                localStorage.setItem("password", password);

                // Assuming the server responds with an 'admin' field that is true for admins
                localStorage.setItem("isAdmin", response.data.admin ? "true" : "false");

                if (response.data.admin) {
                    window.location.href = "/statistics"; // Redirect to admin page
                } else {
                    window.location.href = "/lunches"; // Redirect to normal user page
                }
            } else {
                setError("Invalid credentials");
            }
        } catch (err) {
            setError("Server error. Please try again.");
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="text-xl font-bold mb-4">Login</h2>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Username"
                        className="login-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Heslo"
                        className="login-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit" className="login-button">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
