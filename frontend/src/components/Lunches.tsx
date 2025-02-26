import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
    const navigate = useNavigate();
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
            .catch((err) => {
                console.error("Error fetching lunches:", err);
                setError("Failed to load lunches.");
            })
            .finally(() => setLoading(false));
    }, [userEmail]);

    const handleLunchClick = (lunchId: number, rated: boolean) => {
        if (!rated) {
            navigate(`/rating/${lunchId}`);
        }
    };


    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Your Lunches</h1>

            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}

            <h2 className="text-xl font-semibold mt-4">Unrated Lunches</h2>
            <ul>
                {lunches.filter(l => !l.rated).map(lunch => (
                    <li
                        key={lunch.lunch_id}
                        onClick={() => handleLunchClick(lunch.lunch_id, lunch.rated)}
                        className="cursor-pointer p-2 border rounded bg-yellow-100 hover:bg-yellow-200 mt-2"
                    >
                        {lunch.name} - {new Date(lunch.lunch_date).toLocaleDateString()}
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