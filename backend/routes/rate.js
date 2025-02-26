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
                    if (diffInDays >= 1) {
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

    // Fetch questions and options
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
}

module.exports = { defineAPIRatingEndpoint };