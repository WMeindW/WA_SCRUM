import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Lunches from "./components/Lunches.tsx";
import Login from "./components/Login.tsx";
import Statistics from "./components/Statistics.tsx";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/jidelna/lunches" element={<Lunches/>}/> {/* Lunches is the second page */}
                <Route path="/jidelna/" element={<Login/>}/> {/* Login is the first page */}
                <Route path="/jidelna/statistics" element={<Statistics/>}/> {}
            </Routes>
        </Router>
    );
}

export default App;