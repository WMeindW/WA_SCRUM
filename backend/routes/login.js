const { pool } = require("../db_conn");

function defineAPILoginEndpoints(app) {
    app.post("/api/login", async (req, res) => {
        const { username, password } = req.body;

        console.log("Received login attempt:", { username, password });

        if (!username || !password) {
            return res.status(400).send("Username and password are required");
        }

        try {
            const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [username]);

            console.log("Query result:", rows);

            if (rows.length > 0) {
                const user = rows[0];

                if (user.Heslo === password) {
                    req.session.userId = user.UzivatelID;
                    req.session.role = user.RoleID;

                    console.log("Session after login:", req.session);
                    return res.status(200).send("Login successful");
                } else {
                    return res.status(401).send("Invalid username or password");
                }
            } else {
                return res.status(401).send("Invalid username or password");
            }
        } catch (err) {
            console.error("Error during login:", err);
            return res.status(500).send("Error processing login request");
        }
    });
}

module.exports = { defineAPILoginEndpoints };
