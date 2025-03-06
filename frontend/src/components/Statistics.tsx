import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import to navigate to another page

interface Statistic {
    id: number;
    date: string;
    soup: string;
    lunch1: string;
    lunch2: string;
    avg_rating?: number;
    total_ratings?: number;
}

const Statistics = () => {
    const [statistics, setStatistics] = useState<{
        most_rated: Statistic | null;
        best_rated: Statistic | null;
        worst_rated: Statistic | null;
        total_votes: number;
    }>( {
        most_rated: null,
        best_rated: null,
        worst_rated: null,
        total_votes: 0,
    });
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const user = localStorage.getItem("userEmail");
    const password = localStorage.getItem("password");
    const isAdmin = localStorage.getItem("isAdmin") === "true"; // Get the admin status from localStorage
    const navigate = useNavigate(); // Initialize navigate for navigation

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        try {
            const response = await axios.get("/jidelna/lunch/stats");
            setStatistics(response.data);
        } catch (err) {
            setError("❌ Chyba při načítání statistik.");
        }
    };

    const sendStatisticsEmail = async () => {
        setMessage("");
        setError("");

        if (!email || !user || !password) {
            setError("❌ Zadejte platný email a přihlaste se.");
            return;
        }

        try {
            const response = await axios.post("/jidelna/api/statistics", {
                email,
                user,
                password,
            });

            setMessage(response.data.message);
        } catch (err) {
            setError("❌ Chyba při odesílání statistik.");
        }
    };

    const goToLunchRatings = () => {
        navigate("/lunches"); // Navigate to the lunch ratings page
    };

    const handleLogout = () => {
        localStorage.clear(); // Removes all stored user data
        window.location.href = "/"; // Redirects to the login page
    };

    return (
        <div className="statistics">
            <h2>📊 Statistiky</h2>

            {error && <p className="error-message">{error}</p>}
            {message && <p className="success-message">{message}</p>}

            <table>
                <thead>
                <tr>
                    <th>Typ</th>
                    <th>Datum</th>
                    <th>Polévka</th>
                    <th>Hlavní jídlo 1</th>
                    <th>Hlavní jídlo 2</th>
                    <th>Hodnocení</th>
                </tr>
                </thead>
                <tbody>
                {statistics.most_rated && (
                    <tr>
                        <td>🔥 Nejvíce hodnocený</td>
                        <td>{new Date(statistics.most_rated.date).toLocaleDateString()}</td>
                        <td>{statistics.most_rated.soup}</td>
                        <td>{statistics.most_rated.lunch1}</td>
                        <td>{statistics.most_rated.lunch2}</td>
                        <td>{statistics.most_rated.total_ratings} hodnocení</td>
                    </tr>
                )}
                {statistics.best_rated && (
                    <tr>
                        <td>🏆 Nejlépe hodnocený</td>
                        <td>{new Date(statistics.best_rated.date).toLocaleDateString()}</td>
                        <td>{statistics.best_rated.soup}</td>
                        <td>{statistics.best_rated.lunch1}</td>
                        <td>{statistics.best_rated.lunch2}</td>
                        <td>
                            {statistics.best_rated?.avg_rating != null
                                ? Math.round(statistics.best_rated.avg_rating * 100) / 100
                                : "0"}⭐
                        </td>
                    </tr>
                )}
                {statistics.worst_rated && (
                    <tr>
                        <td>💀 Nejhůře hodnocený</td>
                        <td>{new Date(statistics.worst_rated.date).toLocaleDateString()}</td>
                        <td>{statistics.worst_rated.soup}</td>
                        <td>{statistics.worst_rated.lunch1}</td>
                        <td>{statistics.worst_rated.lunch2}</td>
                        <td>
                            {statistics.worst_rated?.avg_rating != null
                                ? Math.round(statistics.worst_rated.avg_rating * 100) / 100
                                : "0"}⭐
                        </td>
                    </tr>
                )}
                </tbody>
            </table>

            <h3>📢 Celkový počet hodnocení: {statistics.total_votes}</h3>

            <div className="email-section">
                <input
                    type="email"
                    placeholder="Zadejte váš email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <button onClick={sendStatisticsEmail}>📧 Odeslat Statistiky</button>
            </div>

            <div className="button-container">
                {isAdmin && (
                    <button onClick={goToLunchRatings} className="admin-button">
                        🍴 Přejít na stránku hodnocení obědů
                    </button>
                )}

                <button onClick={handleLogout} className="logout-button">
                    🚪Odhlásit se
                </button>
            </div>
        </div>
    );
};

export default Statistics;
