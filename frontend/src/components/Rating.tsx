import { useEffect, useState } from "react";
import axios from "axios";

// Definice rozhraní pro otázky
interface Question {
    id: number;
    text: string;
    options: string[];
}

// Definice rozhraní pro props komponenty Rating
interface RatingProps {
    lunch_id: number;
    meal: string;
    onRatingSubmitted?: (lunchId: number) => void;
}

/**
 * @component Rating
 * @description Komponenta pro hodnocení oběda.
 * @param {RatingProps} props Props komponenty.
 * @returns {JSX.Element} Formulář pro hodnocení oběda.
 */
const Rating = ({ lunch_id, meal, onRatingSubmitted }: RatingProps) => {
    // Stav pro otázky, odpovědi, průměrná hodnocení a chybové zprávy
    const [questions, setQuestions] = useState<Question[]>([]);
    const [responses, setResponses] = useState<Record<number, number>>({});
    const [meanRatings, setMeanRatings] = useState<Record<number, number>>({});
    const [error, setError] = useState("");

    const userEmail = localStorage.getItem("userEmail");
    const password = localStorage.getItem("password");

    // Načtení otázek a uložených odpovědí při načtení komponenty
    useEffect(() => {
        if (!userEmail) {
            setError("You must be logged in to submit a rating.");
            return;
        }

        // Načtení uložených odpovědí z localStorage
        const savedResponses = localStorage.getItem(`rating_${lunch_id}`);
        if (savedResponses) {
            setResponses(JSON.parse(savedResponses));
        }

        // Získání otázek z API
        axios.get("http://localhost:5000/api/questions")
            .then((res) => {
                setQuestions(res.data);

                // Nastavení výchozích odpovědí
                const defaultResponses: Record<number, number> = {};
                res.data.forEach((q: Question) => {
                    defaultResponses[q.id] = Math.floor(q.options.length / 2) + 1;
                });

                // Pokud nejsou uložené odpovědi, použijeme výchozí
                if (!savedResponses) {
                    setResponses(defaultResponses);
                }
            })
            .catch(() => setError("Failed to load questions."));

        // Načtení průměrných hodnocení pro každou otázku
        console.log("Fetching mean ratings for lunch_id:", lunch_id);
        axios.get(`http://localhost:5000/api/questions/mean-ratings?lunch_id=${lunch_id}`)
            .then((res) => {
                console.log("Received mean ratings:", res.data);

                // Konverze řetězcových hodnot na čísla a zaokrouhlení
                const processedRatings = Object.fromEntries(
                    Object.entries(res.data).map(([key, value]) => [key, parseFloat(value as string)])
                );

                setMeanRatings(processedRatings);
            })
            .catch(() => {
                console.error("Failed to fetch mean ratings.");
                setMeanRatings({});
            });

    }, [lunch_id, userEmail]);

    // Zpracování změny odpovědi
    const handleChange = (id: number, value: number) => {
        const updatedResponses = { ...responses, [id]: value };
        setResponses(updatedResponses);

        // Uložení odpovědí do localStorage
        localStorage.setItem(`rating_${lunch_id}`, JSON.stringify(updatedResponses));
    };

    // Zpracování odeslání hodnocení
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validace přihlášení
        if (!userEmail) {
            alert("Error: You must be logged in to submit a rating.");
            return;
        }

        // Validace odpovědí
        if (Object.keys(responses).length < questions.length) {
            alert("Error: Please answer all questions before submitting.");
            return;
        }

        try {
            // Odeslání hodnocení na API
            await axios.post("http://localhost:5000/api/rate", {
                email: userEmail,
                password: password,
                lunch_id,
                meal,
                responses,
            });

            alert("Rating submitted successfully!");

            // Odstranění uložených odpovědí z localStorage
            localStorage.removeItem(`rating_${lunch_id}`);

            // Volání callbacku pro odeslání hodnocení
            if (onRatingSubmitted) {
                onRatingSubmitted(lunch_id);
            }
        } catch (err) {
            setError("Failed to submit rating.");
        }
    };

    return (
        <div className="rating-form">
            <h2>🍴 Ohodnoťte {meal === "lunch1" ? "1. Oběd" : "2. Oběd"}</h2>
            {error && <p className="error-message">{error}</p>}

            <form onSubmit={handleSubmit}>
                {questions.map((q) => (
                    <div key={q.id} className="question-container">
                        <p>{q.text}</p>
                        <input
                            type="range"
                            min="1"
                            max={q.options.length}
                            step="1"
                            value={responses[q.id] ?? Math.floor(q.options.length / 2) + 1}
                            onChange={(e) => handleChange(q.id, parseInt(e.target.value))}
                        />
                        <div className="options">
                            {q.options.map((option, index) => (
                                <span
                                    key={index}
                                    className={`option ${responses[q.id] === index + 1 ? "selected" : ""}`}
                                >
                                    {index + 1}. {option}
                                </span>
                            ))}
                        </div>
                        {/* Zobrazení průměrného hodnocení vedle posuvníku */}
                        <p className="mean-rating">
                            📊 Průměrné hodnocení: {meanRatings[q.id] !== undefined ? meanRatings[q.id].toFixed(1) : "N/A"}
                        </p>
                    </div>
                ))}
                <button type="submit" className="submit-button">
                    Odeslat hodnocení
                </button>
            </form>
        </div>
    );
};

export default Rating;