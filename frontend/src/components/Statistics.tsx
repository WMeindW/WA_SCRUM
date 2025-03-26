import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Definice rozhraní pro data statistik
interface Statistic {
    id: number;
    date: string;
    soup: string;
    lunch1: string;
    lunch2: string;
    avg_rating?: number;
    total_ratings?: number;
    rating_count?: number;
}

/**
 * @component Statistics
 * @description Komponenta pro zobrazení statistik hodnocení obědů.
 * @returns {JSX.Element} Komponenta pro zobrazení statistik.
 */
const Statistics = () => {
    // Stav pro statistiky, email, data pro filtrování a zprávy
    const [statistics, setStatistics] = useState<{
        most_rated: Statistic | null;
        best_rated: Statistic | null;
        worst_rated: Statistic | null;
        total_votes: number;
    }>({
        most_rated: null,
        best_rated: null,
        worst_rated: null,
        total_votes: 0,
    });

    const [email, setEmail] = useState("");

    // Nastavení výchozích dat pro filtrování
    const today = new Date().toISOString().split("T")[0];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const defaultFromDate = sevenDaysAgo.toISOString().split("T")[0];

    const [fromDate, setFromDate] = useState(defaultFromDate);
    const [toDate, setToDate] = useState(today);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const user = localStorage.getItem("userEmail");
    const password = localStorage.getItem("password");
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    const navigate = useNavigate();

    // Načtení statistik při načtení komponenty a při změně dat filtru
    useEffect(() => {
        fetchStatistics();
    }, [fromDate, toDate]);

    /**
     * @async
     * @function fetchStatistics
     * @description Funkce pro načtení statistik z API.
     */
    const fetchStatistics = async () => {
        if (!fromDate || !toDate) {
            setError("❌ Musíte vybrat časové období.");
            return;
        }

        setError("");
        try {
            // Získání statistik z API
            const response = await axios.get("http://localhost:5000/lunch/stats", {
                params: {
                    from_date: fromDate,
                    to_date: toDate,
                },
            });
            setStatistics(response.data);
        } catch (err) {
            setError("❌ Chyba při načítání statistik.");
        }
    };

    /**
     * @async
     * @function sendStatisticsEmail
     * @description Funkce pro odeslání statistik emailem.
     */
    const sendStatisticsEmail = async () => {
        setMessage("");
        setError("");

        if (!email || !user || !password || !fromDate || !toDate) {
            setError("❌ Vyplňte všechny údaje.");
            return;
        }

        try {
            // Odeslání požadavku na API pro odeslání emailu
            const response = await axios.post("http://localhost:5000/api/statistics", {
                email,
                user,
                password,
                from: fromDate,
                to: toDate,
            });

            setMessage(response.data.message);
        } catch (err) {
            setError("❌ Chyba při odesílání statistik.");
        }
    };

    /**
     * @function goToLunchRatings
     * @description Funkce pro přesměrování na stránku hodnocení obědů.
     */
    const goToLunchRatings = () => {
        navigate("/lunches");
    };

    /**
     * @function handleLogout
     * @description Funkce pro odhlášení uživatele.
     */
    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/";
    };

    return (
        <div className="statistics">
            <h2>📊 Statistiky</h2>

            {error && <p className="error-message">{error}</p>}
            {message && <p className="success-message">{message}</p>}

            <div className="date-range">
                <label>📅 Od: </label>
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                <label>📅 Do: </label>
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>

            <div className="table-container">
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
                                ⭐{statistics.best_rated?.avg_rating != null
                                ? Math.round(statistics.best_rated.avg_rating * 100) / 100 + " / " + statistics.best_rated.rating_count
                                : "0 / " + statistics.best_rated.rating_count}
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
                                ⭐{statistics.worst_rated?.avg_rating != null
                                ? Math.round(statistics.worst_rated.avg_rating * 100) / 100 + " / " + statistics.worst_rated.rating_count
                                : "0 / " + statistics.worst_rated.rating_count}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

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
                        🍴 Hodnocení
                    </button>
                )}

                <button onClick={handleLogout} className="logout-button">
                    🚪 Odhlásit se
                </button>
            </div>
        </div>
    );
};

export default Statistics;