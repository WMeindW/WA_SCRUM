const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const {login} = require('./login');
const { pool } = require("../db_conn");

function defineAPIStatisticsEndpoint(app) {
    app.post('/api/statistics', async (req, res) => {
        const { email,user,password } = req.body;

        if (!email || !user || !password) {
            return res.status(400).json({ error: 'Chybí povinné údaje' });
        }

        if (!await login({username: user, password})){
            return res.status(400).json({ error: 'Uzivatel neni autorizovany' });
        }

        const statisticsFile = await generateStatisticsFile();
        if (!statisticsFile) {
            return res.status(500).json({ error: 'Nepodařilo se vygenerovat soubor se statistikami' });
        }

        try {
            await sendEmailWithAttachment(email, statisticsFile);
            res.json({ message: 'Statistiky byly úspěšně odeslány' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Chyba při odesílání emailu' });
        }
    });

    app.get("/lunch/:id/rating", async (req, res) => {
        const lunchMenuId = req.params.id;

        try {
            const [rows] = await pool.query(
                "SELECT AVG(rating) AS mean_rating FROM user_lunch_ratings WHERE lunch_menu_id = ?",
                [lunchMenuId]
            );

            if (!rows.length || rows[0].mean_rating === null) {
                return res.status(404).json({ error: "Žádné hodnocení pro tento oběd" });
            }

            res.json({ lunch_menu_id: lunchMenuId, mean_rating: parseFloat(rows[0].mean_rating) });
        } catch (error) {
            console.error("❌ Chyba při získávání hodnocení:", error);
            res.status(500).json({ error: "Chyba serveru" });
        }
    });

    app.get("/lunch/stats", async (req, res) => {
        try {
            // 📌 1️⃣ Nejvíce hodnocený oběd
            const [mostRated] = await pool.query(
                `SELECT lm.id, lm.date, s.name AS soup, l1.name AS lunch1, l2.name AS lunch2, COUNT(ulr.rating) AS total_ratings
            FROM lunch_menus lm
            JOIN soups s ON lm.soup_id = s.id
            JOIN lunches l1 ON lm.main_course_1_id = l1.id
            JOIN lunches l2 ON lm.main_course_2_id = l2.id
            LEFT JOIN user_lunch_ratings ulr ON lm.id = ulr.lunch_menu_id
            GROUP BY lm.id
            ORDER BY total_ratings DESC
            LIMIT 1`
            );

            // 📌 2️⃣ Nejlépe hodnocený oběd
            const [bestRated] = await pool.query(
                `SELECT lm.id, lm.date, s.name AS soup, l1.name AS lunch1, l2.name AS lunch2, ROUND(AVG(ulr.rating), 2) AS avg_rating
            FROM lunch_menus lm
            JOIN soups s ON lm.soup_id = s.id
            JOIN lunches l1 ON lm.main_course_1_id = l1.id
            JOIN lunches l2 ON lm.main_course_2_id = l2.id
            LEFT JOIN user_lunch_ratings ulr ON lm.id = ulr.lunch_menu_id
            GROUP BY lm.id
            ORDER BY avg_rating DESC
            LIMIT 1`
            );

            // 📌 3️⃣ Nejhůře hodnocený oběd
            const [worstRated] = await pool.query(
                `SELECT lm.id, lm.date, s.name AS soup, l1.name AS lunch1, l2.name AS lunch2, AVG(ulr.rating) AS avg_rating
            FROM lunch_menus lm
            JOIN soups s ON lm.soup_id = s.id
            JOIN lunches l1 ON lm.main_course_1_id = l1.id
            JOIN lunches l2 ON lm.main_course_2_id = l2.id
            LEFT JOIN user_lunch_ratings ulr ON lm.id = ulr.lunch_menu_id
            GROUP BY lm.id
            ORDER BY avg_rating ASC
            LIMIT 1`
            );

            // 📌 4️⃣ Celkový počet hodnocení
            const [totalVotes] = await pool.query(`SELECT COUNT(*) AS total_votes FROM user_lunch_ratings`);

            res.json({
                most_rated: mostRated[0] || null,
                best_rated: bestRated[0] || null,
                worst_rated: worstRated[0] || null,
                total_votes: totalVotes[0]?.total_votes || 0,
            });

        } catch (error) {
            console.error("❌ Chyba při získávání statistik:", error);
            res.status(500).json({ error: "Chyba serveru" });
        }
    });

    module.exports = app;
}

async function generateStatisticsFile() {
    const data = [
        ['ID', 'Jméno', 'Počet objednávek', 'Celková útrata'],
        [1, 'Jan Novák', 5, '2500 Kč'],
        [2, 'Petr Svoboda', 3, '1800 Kč'],
        [3, 'Alena Dvořáková', 7, '3200 Kč'],
        [4, 'Lucie Králová', 2, '900 Kč']
    ];

    const csvContent = data.map(row => row.join(';')).join('\n');
    const filePath = 'data/statistics.csv';

    try {
        await fs.writeFile(filePath, csvContent, 'utf8');
        return filePath;
    } catch (error) {
        console.error('Chyba při generování souboru:', error);
        return null;
    }
}

async function sendEmailWithAttachment(to, filePath) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'wascrum@gmail.com',
            pass: 'doth dasf qjrc ifgb',
        },
    });

    await transporter.sendMail({
        from: 'wascrum@gmail.com',
        to,
        subject: 'Statistiky',
        text: 'Zde jsou vaše statistiky.',
        attachments: [{ filename: 'statistics.csv', path: filePath }],
    });
}
module.exports = { defineAPIStatisticsEndpoint };
