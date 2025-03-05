import { useState, useEffect } from "react";
import axios from "axios";

interface Statistic {
    id: number;
    name: string;
    orderCount: number;
    totalSpent: string;
}

const Statistics = () => {
    const [statistics, setStatistics] = useState<Statistic[]>([]);
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const user = localStorage.getItem("userEmail");
    const password = localStorage.getItem("password");

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/statistics-data");
            setStatistics(response.data);
        } catch (err) {
            setError("Chyba při načítání statistik.");
        }
    };

    const sendStatisticsEmail = async () => {
        setMessage("");
        setError("");

        if (!email || !user || !password) {
            setError("Zadejte platný email a přihlaste se.");
            return;
        }

        try {
            const response = await axios.post("http://localhost:5000/api/statistics", {
                email,
                user,
                password
            });

            setMessage(response.data.message);
        } catch (err) {
            setError("Chyba při odesílání statistik.");
        }
    };

    return (
        <div className="admin-statistics">
            <h2>📊 Statistiky</h2>

            {error && <p className="error-message">{error}</p>}
            {message && <p className="success-message">{message}</p>}

            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Jméno</th>
                    <th>Počet objednávek</th>
                    <th>Celková útrata</th>
                </tr>
                </thead>
                <tbody>
                {statistics.map((stat) => (
                    <tr key={stat.id}>
                        <td>{stat.id}</td>
                        <td>{stat.name}</td>
                        <td>{stat.orderCount}</td>
                        <td>{stat.totalSpent}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            <div className="email-section">
                <input
                    type="email"
                    placeholder="Zadejte váš email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <button onClick={sendStatisticsEmail}>📧 Odeslat Statistiky</button>
            </div>
        </div>
    );
};

export default Statistics;
