import { useState, useEffect } from "react";
import axios from "axios";

interface Question {
    id: number;
    text: string;
    options: string[];
}

interface RatingProps {
    lunch_id: number;
}

const Rating = ({ lunch_id }: RatingProps) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [responses, setResponses] = useState<Record<number, string>>({});
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

    const handleChange = (id: number, value: string) => {
        setResponses((prev) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!userEmail) {
            setError("You must be logged in to submit a rating.");
            return;
        }

        if (Object.keys(responses).length < questions.length) {
            setError("Please answer all questions.");
            return;
        }

        try {
            const submitResponse = await axios.post("http://localhost:5000/api/submit-rating", {
                email: userEmail,
                lunch_id,
                responses,
            });

            if (submitResponse.data.success) {
                // Update last vote date after submission
                await axios.post("http://localhost:5000/api/update-vote-date", { email: userEmail });

                setSubmitted(true);
            } else {
                setError("Submission failed. Please try again.");
            }
        } catch (err) {
            setError("Server error. Please try again later.");
        }
    };


    return (
        <div className="mt-4 bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-bold mb-2">Rate Your Lunch</h2>
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <form onSubmit={handleSubmit}>
                {questions.length > 0 ? (
                    questions.map((q) => (
                        <div key={q.id} className="mb-3">
                            <p className="mb-1">{q.text}</p>
                            <select
                                className="w-full p-2 border rounded"
                                value={responses[q.id] || ""}
                                onChange={(e) => handleChange(q.id, e.target.value)}
                                disabled={submitted}
                            >
                                <option value="" disabled>Select an option</option>
                                {q.options.map((option, index) => (
                                    <option key={index} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                    ))
                ) : (
                    <p>Loading questions...</p>
                )}

                <button
                    type="submit"
                    className={`w-full p-2 rounded ${submitted ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`}
                    disabled={submitted}
                >
                    {submitted ? "Already Submitted" : "Submit Rating"}
                </button>
            </form>
        </div>
    );
};

export default Rating;
