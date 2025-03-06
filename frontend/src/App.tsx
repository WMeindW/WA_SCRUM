import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Lunches from "./components/Lunches.tsx";
import Login from "./components/Login.tsx";
import Statistics from "./components/Statistics.tsx";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/lunches" element={<Lunches/>}/> {/* Lunches is the second page */}
                <Route path="/" element={<Login/>}/> {/* Login is the first page */}
                <Route path="/statistics" element={<Statistics/>}/> {}
            </Routes>
        </Router>
    );
}

export default App;