import { useState, useEffect } from "react";
import axios from "axios";
import Rating from "./Rating";

interface Lunch {
    lunch_menu_id: number;
    menu_date: string;
    soup: string;
    lunch1: string;
    lunch2: string;
    rated: number;
    ratingCount?: number; // Number of ratings received
    meanRating?: number; // Average rating for the lunch
}

const Lunches = () => {
    const [lunches, setLunches] = useState<Lunch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedLunchId, setSelectedLunchId] = useState<number | null>(null);
    const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
    const [averageRatingCount, setAverageRatingCount] = useState<number | null>(null);
    const userEmail = localStorage.getItem("userEmail");

    // Fetch lunches
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

    // Fetch ratings once lunches are loaded
    useEffect(() => {
        if (lunches.length === 0) return; // Ensure lunches are loaded before fetching ratings

        const fetchRatings = async () => {
            try {
                const ratingPromises = lunches.map(async (lunch) => {
                    try {
                        const res = await axios.get(`http://localhost:5000/lunch/${lunch.lunch_menu_id}/rating`);
                        if (res.data.error) {
                            // If the API returns an error, return null for meanRating
                            return { lunch_menu_id: lunch.lunch_menu_id, meanRating: null };
                        }
                        return { lunch_menu_id: lunch.lunch_menu_id, meanRating: res.data.mean_rating };
                    } catch {
                        return { lunch_menu_id: lunch.lunch_menu_id, meanRating: null };
                    }
                });

                const ratings = await Promise.all(ratingPromises);

                setLunches((prevLunches) =>
                    prevLunches.map((lunch) => {
                        const ratingData = ratings.find((r) => r.lunch_menu_id === lunch.lunch_menu_id);
                        return { ...lunch, meanRating: ratingData?.meanRating ?? null };
                    })
                );

                const validRatings = ratings.filter((r) => r.meanRating !== null);
                if (validRatings.length > 0) {
                    const sumRatings = validRatings.reduce((sum, r) => sum + (r.meanRating || 0), 0);
                    setAverageRatingCount(sumRatings / validRatings.length);
                }
            } catch (error) {
                console.error("Error fetching ratings:", error);
            }
        };


        fetchRatings();
    }, [lunches.length]);

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

    const handleLogout = () => {
        localStorage.clear(); // Removes all stored user data
        window.location.href = "/"; // Redirects to the login page
    };

    return (
        <div className="container">
            <h1>Your Lunches</h1>

            {loading && <p>Loading...</p>}
            {error && <p className="error-message">{error}</p>}

            <h2>🍽 Unrated Lunches</h2>
            <ul className="lunch-list">
                {lunches.filter(l => l.rated === 0).map(lunch => {
                    const anomaly =
                        lunch.meanRating !== undefined && lunch.meanRating !== null &&
                        averageRatingCount !== null &&
                        (lunch.meanRating > averageRatingCount * 1.5 || lunch.meanRating < averageRatingCount * 0.5);

                    return (
                        <li
                            key={lunch.lunch_menu_id}
                            className={`lunch-item unrated ${selectedLunchId === lunch.lunch_menu_id ? "selected-lunch" : ""} ${anomaly ? "anomaly" : ""}`}
                            onClick={() => handleLunchClick(lunch.lunch_menu_id)}
                        >
                            <div className="lunch-header">
                                <span className="lunch-date">{new Date(lunch.menu_date).toLocaleDateString()}</span>
                                {anomaly && <span className="anomaly-warning">⚠️ Anomaly</span>}
                            </div>
                            <div className="lunch-body">
                                <p className="lunch-soup">🍜 <strong>Soup:</strong> {lunch.soup}</p>
                                <p className="lunch-main">
                                    🍽 <strong>Main Course 1:</strong> {lunch.lunch1}
                                </p>
                                <p className="lunch-main">
                                    🍽 <strong>Main Course 2:</strong> {lunch.lunch2}
                                </p>
                            </div>
                            <div className="lunch-footer">
                                ⭐ <span className="rating">Rating: {lunch.meanRating !== undefined && lunch.meanRating !== null ? lunch.meanRating.toFixed(1) : "No Ratings"}</span>
                            </div>
                        </li>
                    );
                })}
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
                    onRatingSubmitted={handleRatingSubmitted}
                />
            )}

            <h2>✅ Rated Lunches</h2>
            <ul className="lunch-list">
                {lunches.filter(l => l.rated === 1).map(lunch => {
                    const anomaly =
                        lunch.meanRating !== undefined && lunch.meanRating !== null &&
                        averageRatingCount !== null &&
                        (lunch.meanRating > averageRatingCount * 1.5 || lunch.meanRating < averageRatingCount * 0.5);

                    return (
                        <li
                            key={lunch.lunch_menu_id}
                            className={`lunch-item rated ${anomaly ? "anomaly" : ""}`}
                        >
                            <div className="lunch-header">
                                <span className="lunch-date">{new Date(lunch.menu_date).toLocaleDateString()}</span>
                                {anomaly && <span className="anomaly-warning">⚠️ Anomaly</span>}
                            </div>
                            <div className="lunch-body">
                                <p className="lunch-soup">🍜 <strong>Soup:</strong> {lunch.soup}</p>
                                <p className="lunch-main">
                                    🍽 <strong>Main Course 1:</strong> {lunch.lunch1}
                                </p>
                                <p className="lunch-main">
                                    🍽 <strong>Main Course 2:</strong> {lunch.lunch2}
                                </p>
                            </div>
                            <div className="lunch-footer">
                                ⭐ <span className="rating">Rating: {lunch.meanRating !== undefined && lunch.meanRating !== null ? lunch.meanRating.toFixed(1) : "No Ratings"}</span>
                            </div>
                        </li>
                    );
                })}
            </ul>

            <button onClick={handleLogout} className="logout-button">
                🚪Logout
            </button>
        </div>
    );
};

export default Lunches;