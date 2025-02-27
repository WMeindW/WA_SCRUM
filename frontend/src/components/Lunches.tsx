import { useState, useEffect } from "react";
import axios from "axios";
import Rating from "./Rating"; // Import the Rating component

interface Lunch {
    lunch_menu_id: number;
    menu_date: string;
    soup: string;
    lunch1: string;
    lunch2: string;
    rated: number;
}

const Lunches = () => {
    const [lunches, setLunches] = useState<Lunch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedLunchId, setSelectedLunchId] = useState<number | null>(null);
    const userEmail = localStorage.getItem("userEmail");

    useEffect(() => {
        if (!userEmail) {
            setError("User not logged in");
            return;
        }

        axios.get(`http://localhost:5000/api/lunches?email=${userEmail}`)
            .then((res) => {
                if (Array.isArray(res.data)) {
                    setLunches(res.data);
                } else {
                    throw new Error("Invalid API response format");
                }
            })
            .catch(() => setError("Failed to load lunches."))
            .finally(() => setLoading(false));
    }, [userEmail]);

    const handleLunchClick = (lunchId: number) => {
        setSelectedLunchId((prev) => (prev === lunchId ? null : lunchId)); // Toggle visibility
    };

    return (
        <div className="container">
            <h1>Your Lunches</h1>

            {loading && <p>Loading...</p>}
            {error && <p className="error-message">{error}</p>}

            <h2>🍽 Unrated Lunches</h2>
            <ul className="lunch-list">
                {lunches.filter(l => l.rated === 0).map(lunch => (
                    <li
                        key={lunch.lunch_menu_id}
                        className={`lunch-item unrated ${selectedLunchId === lunch.lunch_menu_id ? "selected-lunch" : ""}`}
                        onClick={() => handleLunchClick(lunch.lunch_menu_id)}
                    >
                        🍜 {lunch.soup} | 🍽 {lunch.lunch1} & {lunch.lunch2} - {new Date(lunch.menu_date).toLocaleDateString()}
                    </li>
                ))}
            </ul>

            {selectedLunchId && <Rating lunch_id={selectedLunchId} />}

            <h2>✅ Rated Lunches</h2>
            <ul className="lunch-list">
                {lunches.filter(l => l.rated === 1).map(lunch => (
                    <li key={lunch.lunch_menu_id} className="lunch-item rated">
                        🍜 {lunch.soup} | 🍽 {lunch.lunch1} & {lunch.lunch2} - {new Date(lunch.menu_date).toLocaleDateString()}
                    </li>
                ))}
            </ul>
        </div>
    );


};

export default Lunches;
