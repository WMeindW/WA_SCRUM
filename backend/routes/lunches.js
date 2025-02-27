const { pool } = require("../db_conn");

function defineLunchEndpoints(app) {
    app.get("/api/lunches", async (req, res) => {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        try {
            console.log(`📢 Získávám obědy pro uživatele: ${email}`);

            // 🟡 Zavolání procedury GetUserLastLunchesWithRating
            const [rows] = await pool.query("CALL GetUserLastLunchesWithRating(?)", [email]);

            console.log("📋 Vrácená data:", rows[0]);

            res.status(200).json(rows[0]);
        } catch (error) {
            console.error("❌ Chyba při získávání obědů:", error);
            res.status(500).json({ error: "Chyba při získávání obědů" });
        }
    });
}

module.exports = { defineLunchEndpoints };
