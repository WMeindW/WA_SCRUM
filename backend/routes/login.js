const bcrypt = require("bcrypt");
const { pool } = require("../db_conn");

const ENDPOINT = "https://strav.nasejidelna.cz";
const CANTEEN_CODE = "0341";
let cookies = new Map();
let autoLoginAttempted = false;
let lastSuccessfulLoginAuth = null;
let lastSuccessfulLoginTime = null;

function defineAPILoginEndpoints(app) {

    app.post('/api/login', async (req, res) => {
        const { email, password } = req.body;

        try {
            // Check if user exists in the database
            const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

            if (rows.length === 0) {
                // If the user doesn't exist, register them
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(password, saltRounds);

                await pool.query("INSERT INTO users (email, password_hash, last_rating_date) VALUES (?, ?, CURDATE())", [email, hashedPassword]);
                console.log("New user registered:", email);
            }

            // Proceed with login attempt
            const isSuccess = await login({ username: email, password });

            if (isSuccess) {
                res.status(200).json({ message: 'Login successful' });
            } else {
                res.status(401).json({ message: 'Invalid credentials' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error during login', error: error.message });
        }
    });
}

async function login(auth) {
    function extractCsrfToken(html) {
        const regex = /name="_csrf" value="([^"]+)"/;
        const match = html.match(regex);
        return match ? match[1] : null;
    }

    async function findCsrfTokenOrThrow(html) {
        const token = extractCsrfToken(html);
        if (!token) throw new Error("CSRF token not found");
        return token;
    }

    async function fetchWithCookies(url, options = {}) {
        const cookieHeader = Array.from(cookies.entries()).map(([k, v]) => `${k}=${v}`).join('; ');
        options.headers = { ...options.headers, Cookie: cookieHeader };
        options.redirect = "manual";

        const response = await fetch(url, options);

        // Získání cookies z odpovědi
        const setCookieHeader = response.headers.get('set-cookie');
        if (setCookieHeader) {
            const cookiesArray = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
            cookiesArray.forEach(cookie => {
                const [name, value] = cookie.split(';')[0].split('=');
                cookies.set(name, value); // Uložení cookies
            });
        }
        return response;
    }

    const loginPageResponse = await fetchWithCookies(`${ENDPOINT}/${CANTEEN_CODE}/login`);
    const loginPageHtml = await loginPageResponse.text();
    const csrfToken = await findCsrfTokenOrThrow(loginPageHtml);

    const loginResponse = await fetchWithCookies(
        `${ENDPOINT}/${CANTEEN_CODE}/j_spring_security_check`,
        {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                j_username: auth.username,
                j_password: auth.password,
                _spring_security_remember_me: "on", // Zapnutí možnosti "zapamatovat si mě"
                type: "web",
                _csrf: csrfToken,
                targetUrl: "/"
            }).toString()
        }
    );

    const success = !loginResponse.headers.get("location")?.includes("login_error=1");
    if (success) {
        lastSuccessfulLoginAuth = auth;
        lastSuccessfulLoginTime = new Date();
    }
    return success;
}

module.exports = { defineAPILoginEndpoints, login };