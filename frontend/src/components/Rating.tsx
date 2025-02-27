import { useState, useEffect } from "react";
import axios from "axios";

interface Question {
    id: number;
    text: string;
    options: string[];
}

interface RatingProps {
    lunch_id: number;
    meal: string; // Either "lunch1" or "lunch2"
}

const Rating = ({ lunch_id, meal }: RatingProps) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [responses, setResponses] = useState<Record<number, number>>({});
    const [error, setError] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const userEmail = localStorage.getItem("userEmail");

    useEffect(() => {
        if (!userEmail) {
            setError("You must be logged in to submit a rating.");
            return;
        }

        axios.get("http://localhost:5000/api/questions")
            .then((res) => setQuestions(res.data))
            .catch(() => setError("Failed to load questions."));
    }, [lunch_id, userEmail]);

    const handleChange = (id: number, value: number) => {
        setResponses((prev) => ({ ...prev, [id]: value }));
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
            const submitResponse = await axios.post("http://localhost:5000/api/submit-rating", {
                email: userEmail,
                lunch_id,
                meal,
                responses,
            });

            if (submitResponse.data.success) {
                await axios.post("http://localhost:5000/api/update-vote-date", { email: userEmail });

                setSubmitted(true);
                alert("Success: Your rating has been submitted!");
            } else {
                alert("Error: Submission failed. Please try again.");
            }
        } catch (err: any) {
            alert(`Error: ${err.response?.data?.message || "Server error. Please try again later."}`);
        }
    };

    return (
        <div className="rating-form">
            <h2>🍴 Rate {meal === "lunch1" ? "Meal 1" : "Meal 2"}</h2>
            {error && <p className="error-message">{error}</p>}

            <form onSubmit={handleSubmit}>
                {questions.map((q) => (
                    <div key={q.id} className="question-container">
                        <p>{q.text}</p>
                        <input
                            type="range"
                            min="0"
                            max={q.options.length - 1}
                            step="1"
                            value={responses[q.id] ?? Math.floor(q.options.length / 2)}
                            onChange={(e) => handleChange(q.id, parseInt(e.target.value))}
                        />
                        <div className="options">
                            {q.options.map((option, index) => (
                                <span
                                    key={index}
                                    className={`option ${responses[q.id] === index ? "selected" : ""}`}
                                >
                                    {index + 1}. {option}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
                <button type="submit" className="submit-button" disabled={submitted}>
                    {submitted ? "Already Submitted" : "Submit Rating"}
                </button>
            </form>
        </div>
    );
};

export default Rating;
