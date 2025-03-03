const nodemailer = require('nodemailer');
const fs = require('fs').promises;

function defineAPIStatisticsEndpoint(app) {
    app.post('/api/statistics', async (req, res) => {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Chybí povinné údaje' });
        }

        const schoolEmail = `${email}@spsejecna.cz`;

        const statisticsFile = await generateStatisticsFile();
        if (!statisticsFile) {
            return res.status(500).json({ error: 'Nepodařilo se vygenerovat soubor se statistikami' });
        }

        try {
            await sendEmailWithAttachment(schoolEmail, statisticsFile);
            res.json({ message: 'Statistiky byly úspěšně odeslány' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Chyba při odesílání emailu' });
        }
    });
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
