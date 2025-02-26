import { useState, useEffect } from "react";
import axios from "axios";
import Rating from "./Rating"; // Import the Rating component

interface Lunch {
    lunch_id: number;
    name: string;
    description: string;
    lunch_date: string;
    rated: boolean;
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

        axios.get(`http://localhost:5000/api/lunches/${userEmail}`)
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
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Your Lunches</h1>

            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}

            <h2 className="text-xl font-semibold mt-4">Unrated Lunches</h2>
            <ul>
                {lunches.filter(l => !l.rated).map(lunch => (
                    <li key={lunch.lunch_id} className="p-2 border rounded bg-yellow-100 mt-2">
                        <button
                            onClick={() => handleLunchClick(lunch.lunch_id)}
                            className="cursor-pointer w-full text-left hover:bg-yellow-200 p-2 rounded"
                        >
                            {lunch.name} - {new Date(lunch.lunch_date).toLocaleDateString()}
                        </button>
                        {selectedLunchId === lunch.lunch_id && <Rating lunch_id={lunch.lunch_id} />}
                    </li>
                ))}
            </ul>

            <h2 className="text-xl font-semibold mt-4">Rated Lunches</h2>
            <ul>
                {lunches.filter(l => l.rated).map(lunch => (
                    <li key={lunch.lunch_id} className="p-2 border rounded bg-gray-100 mt-2">
                        {lunch.name} - {new Date(lunch.lunch_date).toLocaleDateString()}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Lunches;
