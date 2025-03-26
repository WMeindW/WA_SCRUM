import { useState } from "react";
import axios from "axios";

/**
 * @component Login
 * @description Komponenta pro přihlašovací formulář.
 * @returns {JSX.Element} Přihlašovací formulář.
 */
const Login = () => {
    // Stav pro email, heslo a chybové zprávy
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    /**
     * @async
     * @function handleLogin
     * @description Funkce pro zpracování přihlašovacího formuláře.
     * @param {object} e Event objekt formuláře.
     */
    const handleLogin = async (e: { preventDefault: () => void }) => {
        e.preventDefault(); // Zabrání výchozímu chování formuláře
        setError(""); // Resetuje chybovou zprávu

        // Validace vstupních polí
        if (!email || !password) {
            setError("Both fields are required.");
            return;
        }

        try {
            // Odeslání POST požadavku na server pro přihlášení
            const response = await axios.post("http://localhost:5000/api/login", {
                email,
                password,
            }, {
                withCredentials: true // Umožňuje odesílání cookies
            });

            // Zpracování úspěšného přihlášení
            if (response.status === 200) {
                // Uložení emailu a hesla do localStorage (Pozor na bezpečnost!)
                localStorage.setItem("userEmail", email);
                localStorage.setItem("password", password);

                // Uložení informace o administrátorských právech do localStorage
                localStorage.setItem("isAdmin", response.data.admin ? "true" : "false");

                // Přesměrování na příslušnou stránku podle administrátorských práv
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