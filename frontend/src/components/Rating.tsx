import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";

const Rating = () => {
    const [questions, setQuestions] = useState<{ id: number; text: string; options: string[] }[]>([]);
    const [responses, setResponses] = useState<Record<number, string>>({});
    const [error, setError] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [output, setOutput] = useState<string | null>(null);

    useEffect(() => {
        const submitted = Cookies.get("rating_submitted");
        if (submitted) {
            setIsSubmitted(true);
        }

        axios.get("https://daniellinda.net/questions.json")
            .then((res) => {
                console.log("Server Response (Type):", typeof res.data);
                console.log("Raw Server Response:", res.data);

                let parsedData;

                try {
                    // Check if response is a string, then parse it
                    parsedData = typeof res.data === "string" ? JSON.parse(res.data.replace(/\r?\n|\r/g, "")) : res.data;
                } catch (err) {
                    console.error("Error parsing JSON:", err);
                    setError("Invalid question format received from the server.");
                    return;
                }

                if (Array.isArray(parsedData)) {
                    setQuestions(parsedData); // Set valid questions
                } else {
                    console.error("Invalid data format:", parsedData);
                    setError("Invalid question format received.");
                }
            })
            .catch((err) => {
                console.error("Error loading questions:", err);
                setError("Failed to load questions.");
            });
    }, []);


    const handleChange = (id: number, value: string) => {
        setResponses((prev) => ({ ...prev, [id]: value }));
    };

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (Object.keys(responses).length < questions.length) {
            setError("Please answer all questions.");
            return;
        }

        try {
            const response = await axios.post("http://localhost:5000/api/submit-rating", { responses });

            if (response.data.success) {
                Cookies.set("rating_submitted", "true", { expires: 1 });
                setIsSubmitted(true);
                setOutput("Thank you for your feedback! Your responses have been recorded.");
                navigate("/success");  // Redirect to Success Page
            } else {
                navigate("/error", { state: { error: "Submission failed. Please try again." } }); // Redirect to Error Page
            }
        } catch (err) {
            navigate("/error", { state: { error: "Server error. Please try again later." } }); // Redirect on server error
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4 text-center">Food Rating</h2>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {output && <p className="text-green-600 text-sm mb-4">{output}</p>}

                <form onSubmit={handleSubmit}>
                    {questions.length > 0 ? (
                        questions.map((q) => (
                            <div key={q.id} className="mb-3">
                                <p className="mb-1">{q.text}</p>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={responses[q.id] || ""}
                                    onChange={(e) => handleChange(q.id, e.target.value)}
                                    disabled={isSubmitted}
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
                        className={`w-full p-2 rounded ${isSubmitted ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`}
                        disabled={isSubmitted}
                    >
                        {isSubmitted ? "Already Submitted" : "Submit Rating"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Rating;