import * as React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

interface Question {
    id: number;
    text: string;
    options: string[];
}

const Rating = () => {
    const { lunch_id } = useParams<{ lunch_id: string }>();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [responses, setResponses] = useState<Record<number, string>>({});
    const [error, setError] = useState("");
    const [submitted, setSubmitted] = useState(false);

    // Retrieve user email safely
    const userEmail = localStorage.getItem("userEmail");

    useEffect(() => {
        // Redirect to login if userEmail is missing
        if (!userEmail) {
            navigate("/login");
            return;
        }

        // Ensure lunch_id is valid before making requests
        if (!lunch_id || isNaN(Number(lunch_id))) {
            setError("Invalid lunch selection.");
            return;
        }

        // Fetch rating questions
        axios.get("http://localhost:5000/api/questions")
            .then((res) => {
                if (Array.isArray(res.data)) {
                    setQuestions(res.data);
                } else {
                    throw new Error("Invalid API response format");
                }
            })
            .catch(() => setError("Failed to load questions."));
    }, [lunch_id, userEmail, navigate]);

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

        if (!lunch_id || isNaN(Number(lunch_id))) {
            setError("Invalid lunch selection.");
            return;
        }

        if (Object.keys(responses).length < questions.length) {
            setError("Please answer all questions.");
            return;
        }

        try {
            const submitResponse = await axios.post("http://localhost:5000/api/submit-rating", {
                email: userEmail,
                lunch_id: Number(lunch_id),
                responses,
            });

            if (submitResponse.data.success) {
                setSubmitted(true);
                navigate("/lunches"); // Redirect to lunches after rating
            } else {
                setError("Submission failed. Please try again.");
            }
        } catch (err) {
            setError("Server error. Please try again later.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4 text-center">Rate Your Lunch</h2>
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
        </div>
    );
};

export default Rating;
