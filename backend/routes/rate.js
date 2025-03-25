const { pool } = require("../db_conn");  // Import databázového připojení
const { login } = require("./login");   // Import funkce pro přihlášení

/**
 * Definuje API endpointy pro hodnocení jídel a související operace.
 * @param {Object} app - Express aplikace, do které se registrují endpointy
 */
function defineAPIRatingEndpoint(app) {

    /**
     * Endpoint pro kontrolu, zda uživatel může hlasovat.
     * @route GET /api/can-vote
     * @query {string} email - Email uživatele, jehož oprávnění k hlasování se kontroluje.
     */
    app.get("/api/can-vote", async (req, res) => {
        const { email } = req.query;

        console.log("Received eligibility check request for email:", email);

        if (!email) {
            return res.status(400).send("Email is required");
        }

        try {
            const [rows] = await pool.query("SELECT last_rating_date FROM users WHERE email = ?", [email]);

            console.log("Query result:", rows);

            if (rows.length > 0) {
                const user = rows[0];

                if (user.last_rating_date) {
                    const lastRatingDate = new Date(user.last_rating_date);
                    const now = new Date();

                    lastRatingDate.setHours(0, 0, 0, 0);
                    now.setHours(0, 0, 0, 0);

                    const diffInDays = (now - lastRatingDate) / (1000 * 3600 * 24);
                    return res.status(200).json({ canVote: diffInDays >= 1 });
                } else {
                    return res.status(200).json({ canVote: true });
                }
            } else {
                return res.status(404).send("User not found");
            }
        } catch (err) {
            console.error("Error during eligibility check:", err);
            return res.status(500).send("Error processing eligibility check request");
        }
    });

    /**
     * Endpoint pro aktualizaci data posledního hlasování uživatele.
     * @route GET /api/update-vote-date
     * @query {string} email - Email uživatele, jehož datum hlasování se aktualizuje.
     */
    app.get("/api/update-vote-date", async (req, res) => {
        const { email } = req.query;

        if (!email) {
            return res.status(400).send("Email is required");
        }

        try {
            const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

            if (rows.length === 0) {
                return res.status(404).send("User not found");
            }

            const now = new Date();
            await pool.query("UPDATE users SET last_rating_date = ? WHERE email = ?", [now, email]);
            return res.status(200).send("Vote recorded successfully");
        } catch (err) {
            console.error("Error recording vote:", err);
            return res.status(500).send("Error processing vote recording request");
        }
    });

    /**
     * Endpoint pro získání seznamu otázek pro hodnocení.
     * @route GET /api/questions
     * @returns {Array} Seznam otázek s možnými odpověďmi.
     */
    app.get("/api/questions", async (req, res) => {
        try {
            const [questions] = await pool.query("SELECT id, text FROM questions");
            const [options] = await pool.query("SELECT question_id, option_text FROM question_options");

            const formattedQuestions = questions.map(q => ({
                id: q.id,
                text: q.text,
                options: options.filter(opt => opt.question_id === q.id).map(opt => opt.option_text),
            }));

            res.status(200).json(formattedQuestions);
        } catch (error) {
            console.error("Error fetching questions:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });

    /**
     * Endpoint pro odeslání hodnocení oběda.
     * @route POST /api/rate
     * @body {string} email - Email uživatele, který hodnotí.
     * @body {number} lunch_id - ID hodnoceného oběda.
     * @body {Object} responses - Objekt obsahující odpovědi na otázky.
     * @body {string} password - Heslo uživatele pro ověření.
     */
    app.post("/api/rate", async (req, res) => {
        const { email, lunch_id, responses, password } = req.body;

        if (!email || !lunch_id || !responses || !password || Object.keys(responses).length !== 5) {
            return res.status(400).json({ error: "Chybí některý parametr nebo špatný počet odpovědí!" });
        }

        try {
            const isSuccess = await login({ username: email, password });

            if (!isSuccess) {
                return res.status(403).json({ message: "Špatný login." });
            }

            console.log(`📢 Uživatel ${email} hodnotí oběd s ID ${lunch_id}`);

            // Připravíme parametry pro proceduru
            const params = [
                email, lunch_id,
                parseInt(Object.keys(responses)[0]), parseInt(Object.values(responses)[0]),
                parseInt(Object.keys(responses)[1]), parseInt(Object.values(responses)[1]),
                parseInt(Object.keys(responses)[2]), parseInt(Object.values(responses)[2]),
                parseInt(Object.keys(responses)[3]), parseInt(Object.values(responses)[3]),
                parseInt(Object.keys(responses)[4]), parseInt(Object.values(responses)[4])
            ];

            await pool.query("CALL RateLunch(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", params);

            res.status(200).json({ message: "Hodnocení uloženo." });
        } catch (error) {
            console.error("❌ Chyba při ukládání hodnocení:", error);
            res.status(400).json({ error: "Chyba při ukládání hodnocení." });
        }
    });
}

module.exports = { defineAPIRatingEndpoint };  // Export funkce pro registraci endpointů
