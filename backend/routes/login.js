const bcrypt = require("bcrypt");
const { pool } = require("../db_conn");

function defineAPILoginEndpoints(app) {
    app.post("/api/login", async (req, res) => {
        const { email, password } = req.body;

        console.log("Received login attempt:", { email, password });

        if (!email || !password) {
            return res.status(400).send("Email and password are required");
        }

        try {
            const [rows] = await pool.query("SELECT password_hash FROM users WHERE email = ?", [email]);

            console.log("Query result:", rows);

            if (rows.length > 0) {
                const user = rows[0];

                const isPasswordValid = await bcrypt.compare(password, user.password_hash);

                if (isPasswordValid) {
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
