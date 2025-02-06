const bcrypt = require("bcrypt");
const { pool } = require("../db_conn");

function defineAPILoginEndpoints(app) {
    app.post("/api/login", async (req, res) => {
        const { email, password } = req.query;

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

                if (isPasswordValid || password === user.password_hash) {
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

    app.post("/api/register", async (req, res) => {
        const { email, password } = req.query;

        if (!email || !password) {
            return res.status(400).send("Email and password are required");
        }

        try {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            await pool.query("INSERT INTO users (email, password_hash, last_rating_date) VALUES (?, ?, CURDATE())", [email, hashedPassword]);

            return res.status(201).send("User registered successfully");
        } catch (err) {
            console.error("Error during user registration:", err);
            return res.status(500).send("Error processing registration request");
        }
    });
}

module.exports = { defineAPILoginEndpoints };
