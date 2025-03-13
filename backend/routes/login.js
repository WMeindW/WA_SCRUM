const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { pool } = require("../db_conn");
const cookieParser = require('cookie-parser');

const ENDPOINT = "https://strav.nasejidelna.cz";
const CANTEEN_CODE = "0341";
const JWT_SECRET = "tajny_klic";
const JWT_EXPIRATION = "2d";

let cookies = new Map();
let lastSuccessfulLoginAuth = null;
let lastSuccessfulLoginTime = null;

function defineAPILoginEndpoints(app) {
    app.use(cookieParser());

    app.post('/api/login', async (req, res) => {
        const { email, password } = req.body;

        try {
            const token = req.cookies['auth_token'];
            console.log(token)
            if (token) {
                try {
                    const decoded = jwt.verify(token, JWT_SECRET);
                    console.log('prihlaseni prez token');
                    return res.status(200).json({ message: 'Login successful', admin: decoded.admin });
                } catch (error) {
                    console.log('Neplatný token, pokračuji v přihlášení přes jídelnu');
                }
            }else{
                console.log('Pokračuji v přihlášení přes jídelnu');
            }

            const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
            const admin = rows.length > 0 ? rows[0].is_admin : false;

            if (rows.length === 0) {
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(password, saltRounds);
                await pool.query("INSERT INTO users (email, password_hash, last_rating_date) VALUES (?, ?, CURDATE())", [email, hashedPassword]);
                console.log("New user registered:", email);
            }

            const isSuccess = await login({ username: email, password });
            if (isSuccess) {
                const newToken = jwt.sign({ email, admin }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
                res.cookie('auth_token', newToken, { httpOnly: true, secure: false, maxAge: 1000 * 60 * 60 * 24 * 2});
                return res.status(200).json({ message: 'Login successful', admin });
            } else {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
        } catch (error) {
            console.error('Chyba při přihlášení:', error);
            return res.status(500).json({ message: 'Error during login', error: error.message });
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

        try {
            const response = await fetch(url, options);

            const setCookieHeader = response.headers.get('set-cookie');
            if (setCookieHeader) {
                const cookiesArray = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
                cookiesArray.forEach(cookie => {
                    const [name, value] = cookie.split(';')[0].split('=');
                    cookies.set(name, value);
                });
            }
            return response;
        } catch (error) {
            console.error('Chyba při volání fetch:', error);
            throw error;
        }
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
                _spring_security_remember_me: "on",
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
