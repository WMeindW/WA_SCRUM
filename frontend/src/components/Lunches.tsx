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
    const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
    const userEmail = localStorage.getItem("userEmail");

    useEffect(() => {
        if (!userEmail) {
            setError("User not logged in");
            return;
        }

        axios.get(`/jidelna/api/lunches?email=${userEmail}`)
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
        if (selectedLunchId === lunchId) {
            setSelectedLunchId(null);
            setSelectedMeal(null);
        } else {
            setSelectedLunchId(lunchId);
            setSelectedMeal(null);
        }
    };

    const handleRatingSubmitted = (lunchId: number) => {
        setLunches((prevLunches) =>
            prevLunches.map((lunch) =>
                lunch.lunch_menu_id === lunchId ? { ...lunch, rated: 1 } : lunch
            )
        );
        setSelectedLunchId(null); // Hide the rating form
        setSelectedMeal(null);
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

            {selectedLunchId && (
                <div className="meal-selection">
                    <h3>Select the meal to rate:</h3>
                    <select value={selectedMeal || ""} onChange={(e) => setSelectedMeal(e.target.value)}>
                        <option value="" disabled>Select a meal</option>
                        {lunches.find(l => l.lunch_menu_id === selectedLunchId) && (
                            <>
                                <option value="lunch1">{lunches.find(l => l.lunch_menu_id === selectedLunchId)?.lunch1}</option>
                                <option value="lunch2">{lunches.find(l => l.lunch_menu_id === selectedLunchId)?.lunch2}</option>
                            </>
                        )}
                    </select>
                </div>
            )}

            {selectedLunchId && selectedMeal && (
                <Rating
                    lunch_id={selectedLunchId}
                    meal={selectedMeal}
                    onRatingSubmitted={handleRatingSubmitted} // Pass the function
                />
            )}

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
