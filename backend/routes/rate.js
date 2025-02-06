const { pool } = require("../db_conn");

function defineAPIRatingEndpoint(app) {
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

                    const diffInTime = now.getTime() - lastRatingDate.getTime();
                    const diffInDays = diffInTime / (1000 * 3600 * 24);

                    if (diffInDays > 1) {
                        return res.status(200).json({ canVote: true });
                    } else {
                        return res.status(200).json({ canVote: false });
                    }
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
}

module.exports = { defineAPIRatingEndpoint };
