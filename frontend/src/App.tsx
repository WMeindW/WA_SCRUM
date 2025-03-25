import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Lunches from "./components/Lunches.tsx";
import Login from "./components/Login.tsx";
import Statistics from "./components/Statistics.tsx";

/**
 * @component App
 * @description Hlavní komponenta aplikace, která definuje routování.
 * @returns {JSX.Element} Hlavní komponenta aplikace s definovanými routami.
 */
function App() {
    return (
        <Router>
            <Routes>
                {/* Route pro zobrazení seznamu obědů */}
                <Route path="/lunches" element={<Lunches/>}/> {/* Lunches is the second page */}

                {/* Route pro přihlašovací formulář (výchozí cesta) */}
                <Route path="/" element={<Login/>}/> {/* Login is the first page */}

                {/* Route pro zobrazení statistik */}
                <Route path="/statistics" element={<Statistics/>}/> {}
            </Routes>
        </Router>
    );
}

export default App;