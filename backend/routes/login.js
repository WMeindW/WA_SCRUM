const jwt = require('jsonwebtoken');  // Importuje knihovnu pro práci s JSON Web Tokeny (JWT)
const bcrypt = require('bcrypt');  // Importuje knihovnu pro hashování hesel
const { pool } = require("../db_conn");  // Importuje databázové připojení
const cookieParser = require('cookie-parser');  // Importuje middleware pro práci s cookies

const ENDPOINT = "https://strav.nasejidelna.cz";  // URL endpoint jídelny
const CANTEEN_CODE = "0341";  // Kód jídelny
const JWT_SECRET = "tajny_klic";  // Tajný klíč pro podepisování JWT tokenů
const JWT_EXPIRATION = "2d";  // Doba expirace JWT tokenu

let cookies = new Map();  // Mapa pro ukládání cookies při přihlašování
let lastSuccessfulLoginAuth = null;  // Uložené údaje o posledním úspěšném přihlášení
let lastSuccessfulLoginTime = null;  // Čas posledního úspěšného přihlášení

/**
 * Definuje API endpointy pro přihlašování uživatelů.
 * @param {Object} app - Express aplikace, do které se registrují endpointy
 */
function defineAPILoginEndpoints(app) {
    app.use(cookieParser());  // Použití cookie parseru pro práci s cookies

    app.post('/api/login', async (req, res) => {
        const { email, password } = req.body;  // Získání přihlašovacích údajů z requestu

        try {
            const token = req.cookies['auth_token'];  // Získání tokenu z cookies
            console.log(token);
            if (token) {
                try {
                    const decoded = jwt.verify(token, JWT_SECRET);  // Ověření platnosti tokenu
                    console.log('Přihlášení přes token');
                    return res.status(200).json({ message: 'Login successful', admin: decoded.admin });
                } catch (error) {
                    console.log('Neplatný token, pokračuji v přihlášení přes jídelnu');
                }
            } else {
                console.log('Pokračuji v přihlášení přes jídelnu');
            }

            // Kontrola, zda uživatel existuje v databázi
            const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
            const admin = rows.length > 0 ? rows[0].is_admin : false;

            // Pokud uživatel neexistuje, vytvoří se nový účet
            if (rows.length === 0) {
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(password, saltRounds);  // Hashování hesla
                await pool.query("INSERT INTO users (email, password_hash, last_rating_date) VALUES (?, ?, CURDATE())", [email, hashedPassword]);
                console.log("Nový uživatel zaregistrován:", email);
            }

            // Pokus o přihlášení k jídelně
            const isSuccess = await login({ username: email, password });
            if (isSuccess) {
                // Generování nového JWT tokenu
                const newToken = jwt.sign({ email, admin }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
                res.cookie('auth_token', newToken, { httpOnly: true, secure: false, maxAge: 1000 * 60 * 60 * 24 * 2 });
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

/**
 * Pokusí se přihlásit k jídelně pomocí daných přihlašovacích údajů.
 * @param {Object} auth - Objekt s přihlašovacími údaji (username a password)
 * @returns {Promise<boolean>} - Vrací true, pokud bylo přihlášení úspěšné, jinak false
 */
async function login(auth) {

    /**
     * Extrahuje CSRF token z HTML stránky.
     * @param {string} html - HTML kód stránky
     * @returns {string|null} - CSRF token nebo null, pokud není nalezen
     */
    function extractCsrfToken(html) {
        const regex = /name="_csrf" value="([^"]+)"/;
        const match = html.match(regex);
        return match ? match[1] : null;
    }

    /**
     * Najde a vrátí CSRF token, nebo vyhodí chybu, pokud není nalezen.
     * @param {string} html - HTML kód stránky
     * @returns {Promise<string>} - CSRF token
     * @throws {Error} - Vyhodí chybu, pokud token není nalezen
     */
    async function findCsrfTokenOrThrow(html) {
        const token = extractCsrfToken(html);
        if (!token) throw new Error("CSRF token not found");
        return token;
    }

    /**
     * Provádí HTTP požadavek s uloženými cookies.
     * @param {string} url - Cílová URL adresa
     * @param {Object} [options={}] - Možnosti požadavku
     * @returns {Promise<Response>} - Odpověď z požadavku
     */
    async function fetchWithCookies(url, options = {}) {
        const cookieHeader = Array.from(cookies.entries()).map(([k, v]) => `${k}=${v}`).join('; ');
        options.headers = { ...options.headers, Cookie: cookieHeader };
        options.redirect = "manual";

        try {
            const response = await fetch(url, options);

            // Zpracování a uložení cookies z odpovědi
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

    // Načtení přihlašovací stránky a získání CSRF tokenu
    const loginPageResponse = await fetchWithCookies(`${ENDPOINT}/${CANTEEN_CODE}/login`);
    const loginPageHtml = await loginPageResponse.text();
    const csrfToken = await findCsrfTokenOrThrow(loginPageHtml);

    // Odeslání přihlašovacích údajů
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

    // Kontrola, zda přihlášení proběhlo úspěšně
    const success = !loginResponse.headers.get("location")?.includes("login_error=1");
    if (success) {
        lastSuccessfulLoginAuth = auth;
        lastSuccessfulLoginTime = new Date();
    }
    return success;
}

module.exports = { defineAPILoginEndpoints, login };  // Exportuje funkce pro použití v jiných částech aplikace
