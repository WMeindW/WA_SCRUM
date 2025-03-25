const { pool } = require("../db_conn");  // Import databázového připojení

/**
 * Definuje API endpointy pro získávání informací o obědech.
 * @param {Object} app - Express aplikace, do které se registrují endpointy
 */
function defineLunchEndpoints(app) {
    /**
     * Endpoint pro získání obědů uživatele.
     * @route GET /api/lunches
     * @query {string} email - Email uživatele, pro kterého se obědy načítají.
     */
    app.get("/api/lunches", async (req, res) => {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        try {
            console.log(`📢 Získávám obědy pro uživatele: ${email}`);

            // Volání uložené procedury pro získání obědů s hodnocením
            const [rows] = await pool.query("CALL GetUserLastLunchesWithRating(?)", [email]);

            console.log("📋 Vrácená data:", rows[0]);

            res.status(200).json(rows[0]);
        } catch (error) {
            console.error("❌ Chyba při získávání obědů:", error);
            res.status(500).json({ error: "Chyba při získávání obědů" });
        }
    });
}

module.exports = { defineLunchEndpoints };  // Export funkce pro registraci endpointů
