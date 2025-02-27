const { pool } = require("../db_conn");

// 🟡 Funkce pro konverzi datumu na MySQL formát (YYYY-MM-DD)
function parseDate(dateString) {
    const parts = dateString.match(/(\d{2})\.(\d{2})\.(\d{4})/);
    if (!parts) {
        console.error("❌ Chyba při parsování datumu:", dateString);
        return null;
    }
    return `${parts[3]}-${parts[2]}-${parts[1]}`; // Převede na YYYY-MM-DD
}

async function updateLunches(newLunchData) {
    try {
        let { date, soup, obed1, obed2 } = newLunchData;

        // 🟡 Převod formátu datumu
        date = parseDate(date);
        if (!date) {
            console.error("❌ Datum je ve špatném formátu:", newLunchData.date);
            return;
        }

        console.log(`📡 Volám SQL proceduru pro ${date}: ${soup.name}, ${obed1.name}, ${obed2.name}`);

        // 🟡 Zavoláme SQL proceduru pro přidání oběda
        await pool.query("CALL AddFullLunchMenu(?, ?, ?, ?)", [
            soup.name, obed1.name, obed2.name, date
        ]);

        console.log(`✅ Oběd pro ${date} uložen.`);
    } catch (error) {
        console.error("❌ Chyba při ukládání oběda:", error);
    }
}

module.exports = { updateLunches };
