import { Link } from "react-router-dom";

const RatingSuccess = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-green-100">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
                <h2 className="text-xl font-bold text-green-600 mb-4">Submission Successful!</h2>
                <p className="text-gray-700 mb-4">Thank you for your feedback. Your rating has been recorded.</p>
                <Link to="/" className="text-blue-500 hover:underline">Go back to home</Link>
            </div>
        </div>
    );
};

export default RatingSuccess;
