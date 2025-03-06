import {useEffect, useState} from "react";
import axios from "axios";

interface Question {
    id: number;
    text: string;
    options: string[];
}

interface RatingProps {
    lunch_id: number;
    meal: string;
    onRatingSubmitted?: (lunchId: number) => void;
}

const Rating = ({lunch_id, meal, onRatingSubmitted}: RatingProps) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [responses, setResponses] = useState<Record<number, number>>({});
    const [error, setError] = useState("");

    const userEmail = localStorage.getItem("userEmail");
    const password = localStorage.getItem("password");

    useEffect(() => {
        if (!userEmail) {
            setError("You must be logged in to submit a rating.");
            return;
        }

        axios.get("/jidelna/api/questions")
            .then((res) => {
                setQuestions(res.data);

                const defaultResponses: Record<number, number> = {};
                res.data.forEach((q: Question) => {
                    defaultResponses[q.id] = Math.floor(q.options.length / 2) + 1;
                });
                setResponses(defaultResponses);
            })
            .catch(() => setError("Failed to load questions."));
    }, [lunch_id, userEmail]);

    const handleChange = (id: number, value: number) => {
        setResponses((prev) => ({...prev, [id]: value}));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!userEmail) {
            alert("Error: You must be logged in to submit a rating.");
            return;
        }

        if (Object.keys(responses).length < questions.length) {
            alert("Error: Please answer all questions before submitting.");
            return;
        }

        try {
            // Ensure all responses start from 1 (shift indexes +1)
            const adjustedResponses = Object.fromEntries(
                Object.entries(responses).map(([key, value]) => [key, value])
            );

            await axios.post("/jidelna/api/rate", {
                email: userEmail,
                password: password,
                lunch_id,
                meal,
                responses: adjustedResponses, // Store adjusted values
            });

            alert("Rating submitted successfully!");

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
                            min="1" // Shifted from 0 → 1
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