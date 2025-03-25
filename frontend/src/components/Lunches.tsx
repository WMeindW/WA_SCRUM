import { useState, useEffect } from "react";
import axios from "axios";
import Rating from "./Rating";

// Definice rozhraní pro data oběda
interface Lunch {
    lunch_menu_id: number;
    menu_date: string;
    soup: string;
    lunch1: string;
    lunch2: string;
    rated: number;
    ratingCount?: number;
    meanRating?: number;
}

/**
 * @component Lunches
 * @description Komponenta pro zobrazení seznamu obědů a jejich hodnocení.
 * @returns {JSX.Element} Seznam obědů.
 */
const Lunches = () => {
    // Stav pro seznam obědů, stav načítání, chybové zprávy, vybraný oběd a vybrané jídlo
    const [lunches, setLunches] = useState<Lunch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedLunchId, setSelectedLunchId] = useState<number | null>(null);
    const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
    const userEmail = localStorage.getItem("userEmail");

    // Načtení dat obědů při načtení komponenty
    useEffect(() => {
        if (!userEmail) {
            setError("User not logged in");
            return;
        }

        // Získání dat obědů z API
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

    // Načtení hodnocení pro každý oběd
    useEffect(() => {
        if (lunches.length === 0) return;

        const fetchRatings = async () => {
            try {
                // Získání hodnocení pro každý oběd z API
                const ratingPromises = lunches.map(async (lunch) => {
                    try {
                        const res = await axios.get(`http://localhost:5000/lunch/${lunch.lunch_menu_id}/rating`);
                        return res.data.error
                            ? { lunch_menu_id: lunch.lunch_menu_id, meanRating: null, ratingCount: 0 }
                            : { lunch_menu_id: lunch.lunch_menu_id, meanRating: res.data.mean_rating, ratingCount: res.data.rating_count };
                    } catch {
                        return { lunch_menu_id: lunch.lunch_menu_id, meanRating: null, ratingCount: 0 };
                    }
                });

                // Aktualizace stavu obědů s hodnocením
                const ratings = await Promise.all(ratingPromises);

                setLunches((prevLunches) =>
                    prevLunches.map((lunch) => {
                        const ratingData = ratings.find((r) => r.lunch_menu_id === lunch.lunch_menu_id);
                        return { ...lunch, meanRating: ratingData?.meanRating ?? null, ratingCount: ratingData?.ratingCount ?? 0 };
                    })
                );
            } catch (error) {
                console.error("Error fetching ratings:", error);
            }
        };

        fetchRatings();
    }, [lunches.length]);

    // Zpracování kliknutí na oběd
    const handleLunchClick = (lunchId: number) => {
        setSelectedLunchId(selectedLunchId === lunchId ? null : lunchId);
        setSelectedMeal(null);
    };

    // Zpracování odeslání hodnocení
    const handleRatingSubmitted = (lunchId: number) => {
        // Aktualizace stavu obědů s informací o hodnocení
        setLunches((prevLunches) =>
            prevLunches.map((lunch) =>
                lunch.lunch_menu_id === lunchId ? { ...lunch, rated: 1 } : lunch
            )
        );
        setSelectedLunchId(null);
        setSelectedMeal(null);
    };

    // Odhlášení uživatele
    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/";
    };

    return (
        <div className="container">
            <h1>Obědy</h1>

            {loading && <p>Loading...</p>}
            {error && <p className="error-message">{error}</p>}

            <h2>🍽 Nehodnocené obědy</h2>
            <ul className="lunch-list">
                {lunches.filter(l => l.rated === 0).map(lunch => (
                    <li
                        key={lunch.lunch_menu_id}
                        className={`lunch-item unrated ${selectedLunchId === lunch.lunch_menu_id ? "selected-lunch" : ""}`}
                        onClick={() => handleLunchClick(lunch.lunch_menu_id)}
                    >
                        <div className="lunch-header">
                            <span className="lunch-date">{new Date(lunch.menu_date).toLocaleDateString()}</span>
                        </div>
                        <div className="lunch-body">
                            <p className="lunch-soup">🍜 <strong>Polévka:</strong> {lunch.soup}</p>
                            <p className="lunch-main">🍽 <strong>Hlavní jídlo 1:</strong> {lunch.lunch1}</p>
                            <p className="lunch-main">🍽 <strong>Hlavní jídlo 2:</strong> {lunch.lunch2}</p>
                        </div>
                        <div className="lunch-footer">⭐
                            <span className="rating">
                                Rating: {lunch.meanRating !== undefined && lunch.meanRating !== null
                                ? `${lunch.meanRating.toFixed(1)} / ${lunch.ratingCount} ratings`
                                : "No Ratings"}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>

            {selectedLunchId && (
                <div className="meal-selection">
                    <h3>Vyber jídlo na ohodnocení:</h3>
                    <select value={selectedMeal || ""} onChange={(e) => setSelectedMeal(e.target.value)}>
                        <option value="" disabled>Vyber jídlo</option>
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

            <h2>✅ Ohodnocené obědy</h2>
            <ul className="lunch-list">
                {lunches.filter(l => l.rated === 1).map(lunch => (
                    <li key={lunch.lunch_menu_id} className="lunch-item rated">
                        <div className="lunch-header">
                            <span className="lunch-date">{new Date(lunch.menu_date).toLocaleDateString()}</span>
                        </div>
                        <div className="lunch-body">
                            <p className="lunch-soup">🍜 <strong>Polévka:</strong> {lunch.soup}</p>
                            <p className="lunch-main">🍽 <strong>Hlavní jídlo 1:</strong> {lunch.lunch1}</p>
                            <p className="lunch-main">🍽 <strong>Hlavní jídlo 2:</strong> {lunch.lunch2}</p>
                        </div>
                        <div className="lunch-footer">⭐
                            <span className="rating">
                                Rating: {lunch.meanRating !== undefined && lunch.meanRating !== null
                                ? `${lunch.meanRating.toFixed(1)} / ${lunch.ratingCount} ratings`
                                : "No Ratings"}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>

            <button onClick={handleLogout} className="logout-button">
                🚪Odhlásit se
            </button>
        </div>
    );
};

export default Lunches;