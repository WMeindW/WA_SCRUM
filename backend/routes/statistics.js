const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const {login} = require('./login');
const { pool } = require("../db_conn");

function defineAPIStatisticsEndpoint(app) {
    app.post('/api/statistics', async (req, res) => {
        const {email, user, password} = req.body;

        if (!email || !user || !password) {
            return res.status(400).json({error: 'Chybí povinné údaje'});
        }

        if (!await login({username: user, password})) {
            return res.status(400).json({error: 'Uzivatel neni autorizovany'});
        }

        const statisticsFile = await generateStatisticsFile();
        if (!statisticsFile) {
            return res.status(500).json({error: 'Nepodařilo se vygenerovat soubor se statistikami'});
        }

        try {
            await sendEmailWithAttachment(email, statisticsFile);
            res.json({message: 'Statistiky byly úspěšně odeslány'});
        } catch (error) {
            console.log(error);
            res.status(500).json({error: 'Chyba při odesílání emailu'});
        }
    });

    app.get("/lunch/:id/rating", async (req, res) => {
        const lunchMenuId = req.params.id;

        try {
            const [rows] = await pool.query(
                "SELECT AVG(rating) AS mean_rating FROM user_lunch_ratings WHERE lunch_menu_id = ?",
                [lunchMenuId]
            );

            res.json({lunch_menu_id: lunchMenuId, mean_rating: parseFloat(rows[0].mean_rating)});
        } catch (error) {
            console.error("❌ Chyba při získávání hodnocení:", error);
            res.status(500).json({error: "Chyba serveru"});
        }
    });

    /* vrací počet hodnocení pro každý oběd
    * app.get("/lunch/:id/rating", async (req, res) => {
    const lunchMenuId = req.params.id;

    try {
        const [rows] = await pool.query(
            "SELECT AVG(rating) AS mean_rating, COUNT(rating) AS rating_count FROM user_lunch_ratings WHERE lunch_menu_id = ?",
            [lunchMenuId]
        );

        res.json({
            lunch_menu_id: lunchMenuId,
            mean_rating: rows[0].mean_rating ? parseFloat(rows[0].mean_rating) : null,
            rating_count: rows[0].rating_count || 0, // Default to 0 if no ratings exist
        });
    } catch (error) {
        console.error("❌ Error fetching rating:", error);
        res.status(500).json({ error: "Server error" });
    }
});

    * */

    app.get("/lunch/stats", async (req, res) => {
        try {
            const stats = await generateStatistics();
            res.json(stats);
        } catch (error) {
            res.status(500).json({error: error.message});
        }
    });
}

async function generateStatistics() {
    try {
        // 📌 1️⃣ Nejvíce hodnocený oběd
        const [mostRated] = await pool.query(
            `SELECT lm.id,
                        lm.date,
                        s.name AS soup,
                        l1.name AS lunch1,
                        l2.name AS lunch2,
                        COUNT(ulr.rating) AS total_ratings
                 FROM lunch_menus lm
                          JOIN soups s ON lm.soup_id = s.id
                          JOIN lunches l1 ON lm.main_course_1_id = l1.id
                          JOIN lunches l2 ON lm.main_course_2_id = l2.id
                          LEFT JOIN user_lunch_ratings ulr ON lm.id = ulr.lunch_menu_id
                 GROUP BY lm.id
                 ORDER BY total_ratings DESC LIMIT 1`
        );

        // 📌 2️⃣ Nejlépe hodnocený oběd
        const [bestRated] = await pool.query(
            `SELECT lm.id,
                        lm.date,
                        s.name AS soup,
                        l1.name AS lunch1,
                        l2.name AS lunch2,
                        ROUND(AVG(ulr.rating), 2) AS avg_rating
                 FROM lunch_menus lm
                          JOIN soups s ON lm.soup_id = s.id
                          JOIN lunches l1 ON lm.main_course_1_id = l1.id
                          JOIN lunches l2 ON lm.main_course_2_id = l2.id
                          LEFT JOIN user_lunch_ratings ulr ON lm.id = ulr.lunch_menu_id
                 GROUP BY lm.id
                 ORDER BY avg_rating DESC LIMIT 1`
        );

        // 📌 3️⃣ Nejhůře hodnocený oběd
        const [worstRated] = await pool.query(
            `SELECT lm.id,
                        lm.date,
                        s.name AS soup,
                        l1.name AS lunch1,
                        l2.name AS lunch2,
                        AVG(ulr.rating) AS avg_rating
                 FROM lunch_menus lm
                          JOIN soups s ON lm.soup_id = s.id
                          JOIN lunches l1 ON lm.main_course_1_id = l1.id
                          JOIN lunches l2 ON lm.main_course_2_id = l2.id
                          LEFT JOIN user_lunch_ratings ulr ON lm.id = ulr.lunch_menu_id
                 GROUP BY lm.id
                 ORDER BY avg_rating ASC LIMIT 1`
        );

        // 📌 4️⃣ Celkový počet hodnocení
        const [totalVotes] = await pool.query(`SELECT COUNT(*) AS total_votes
                                                   FROM user_lunch_ratings`);

        return {
            most_rated: mostRated[0] || null,
            best_rated: bestRated[0] || null,
            worst_rated: worstRated[0] || null,
            total_votes: totalVotes[0]?.total_votes || 0,
        };
    } catch (error) {
        console.error("❌ Chyba při získávání statistik:", error);
        throw new Error("Chyba serveru");
    }
}
async function generateStatisticsFile() {
    const data = await generateStatistics();
    const filePath = 'data/statistics.csv';

    const csvContent = [
        "Kategorie;ID;Datum;Polévka;Hlavní jídlo 1;Hlavní jídlo 2;Hodnocení / Počet hlasů",
        `Nejčastěji hodnocené;${data.most_rated.id};${data.most_rated.date};${data.most_rated.soup};${data.most_rated.lunch1};${data.most_rated.lunch2};${data.most_rated.total_ratings}`,
        `Nejlépe hodnocené;${data.best_rated.id};${data.best_rated.date};${data.best_rated.soup};${data.best_rated.lunch1};${data.best_rated.lunch2};${data.best_rated.avg_rating}`,
        `Nejhůře hodnocené;${data.worst_rated.id};${data.worst_rated.date};${data.worst_rated.soup};${data.worst_rated.lunch1};${data.worst_rated.lunch2};${data.worst_rated.avg_rating || "N/A"}`,
        `Celkový počet hlasů;;;${data.total_votes}`
    ].join("\n");

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
