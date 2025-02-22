import { Link, useLocation } from "react-router-dom";

const RatingError = () => {
    const location = useLocation();
    const errorMessage = location.state?.error || "An unknown error occurred.";

    return (
        <div className="flex items-center justify-center min-h-screen bg-red-100">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
                <h2 className="text-xl font-bold text-red-600 mb-4">Submission Failed</h2>
                <p className="text-gray-700 mb-4">{errorMessage}</p>
                <Link to="/" className="text-blue-500 hover:underline">Go back to home</Link>
            </div>
        </div>
    );
};

export default RatingError;