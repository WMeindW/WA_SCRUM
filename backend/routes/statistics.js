const nodemailer = require('nodemailer');
const fs = require('fs'); // Používáme normální fs pro zapisování souborů
const PDFDocument = require('pdfkit');
const { login } = require('./login');
const { pool } = require("../db_conn");

function defineAPIStatisticsEndpoint(app) {
    app.post('/api/statistics', async (req, res) => {
        const { email, user, password } = req.body;

        if (!email || !user || !password) {
            return res.status(400).json({ error: 'Chybí povinné údaje' });
        }

        if (!await login({ username: user, password })) {
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

            res.json({ lunch_menu_id: lunchMenuId, mean_rating: parseFloat(rows[0].mean_rating) });
        } catch (error) {
            console.error("❌ Chyba při získávání hodnocení:", error);
            res.status(500).json({ error: "Chyba serveru" });
        }
    });

    app.get("/lunch/stats", async (req, res) => {
        try {
            const stats = await generateStatistics();
            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: error.message });
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

const removeDiacritics = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Měsíce jsou indexovány od 0
    const year = date.getFullYear();
    return `${day}. ${month}. ${year}`;
};

async function generateStatisticsFile() {
    const data = await generateStatistics();
    const filePath = 'data/statistics.pdf';

    const doc = new PDFDocument({ margin: 50 });

    doc.pipe(fs.createWriteStream(filePath));

    // Titulek dokumentu
    doc.fontSize(20).text(removeDiacritics("Statistiky hodnoceni jidel"), { align: "center" });
    doc.moveDown(2);

    // Nejčastěji hodnocené jídlo
    doc.fontSize(16).text(removeDiacritics("Nejcasteji hodnocene jidlo"), { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Datum: ${formatDate(data.most_rated.date)}`);
    doc.text(`Polevka: ${removeDiacritics(data.most_rated.soup)}`);
    doc.text(`Hlavni jidlo 1: ${removeDiacritics(data.most_rated.lunch1)}`);
    doc.text(`Hlavni jidlo 2: ${removeDiacritics(data.most_rated.lunch2)}`);
    doc.text(`Celkovy pocet hodnoceni: ${data.most_rated.total_ratings}`);
    doc.moveDown(2);

    // Nejlépe hodnocené jídlo
    doc.fontSize(16).text(removeDiacritics("Nejlepe hodnocene jidlo"), { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Datum: ${formatDate(data.best_rated.date)}`);
    doc.text(`Polevka: ${removeDiacritics(data.best_rated.soup)}`);
    doc.text(`Hlavni jidlo 1: ${removeDiacritics(data.best_rated.lunch1)}`);
    doc.text(`Hlavni jidlo 2: ${removeDiacritics(data.best_rated.lunch2)}`);
    doc.text(`Prumerne hodnoceni: ${data.best_rated.avg_rating}`);
    doc.moveDown(2);

    // Nejhůře hodnocené jídlo
    doc.fontSize(16).text(removeDiacritics("Nejhure hodnocene jidlo"), { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Datum: ${formatDate(data.worst_rated.date)}`);
    doc.text(`Polevka: ${removeDiacritics(data.worst_rated.soup)}`);
    doc.text(`Hlavni jidlo 1: ${removeDiacritics(data.worst_rated.lunch1)}`);
    doc.text(`Hlavni jidlo 2: ${removeDiacritics(data.worst_rated.lunch2)}`);
    doc.text(`Prumerne hodnoceni: ${data.worst_rated.avg_rating || "N/A"}`);
    doc.moveDown(2);

    // Celkový počet hlasů
    doc.fontSize(14).text(removeDiacritics(`Celkovy pocet hlasu: ${data.total_votes}`), { align: "center" });

    doc.end();

    try {
        return filePath;
    } catch (error) {
        console.error('Chyba pri generovani souboru:', error);
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
        attachments: [{ filename: 'statistics.pdf', path: filePath }], // Změněno na PDF
    });
}

module.exports = { defineAPIStatisticsEndpoint };
