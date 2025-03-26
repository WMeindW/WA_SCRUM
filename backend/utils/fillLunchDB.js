const { pool } = require("../db_conn");
const { fetchLunches } = require("./fetchLunches");
const { updateLunches } = require("./updateLunches");

/**
 * @async
 * @function fillLunchDB
 * @description Funkce pro naplnění databáze obědy z webu.
 * @returns {Promise<void>} Promise, která se vyřeší po dokončení naplnění databáze.
 */
async function fillLunchDB() {
    try {
        console.log(" Načítám obědy z webu...");

        // 🟡 Test MySQL připojení (abychom viděli, jestli funguje)
        const [rows] = await pool.query("SELECT 1");
        console.log("✅ MySQL připojení OK:", rows);

        // 🟡 1. Stáhneme jídelníček
        const lunches = await fetchLunches();
        console.log(" Stáhnutá data z webu:", JSON.stringify(lunches, null, 2));

        // Pokud nic nepřišlo, loguj chybu
        if (!lunches || Object.keys(lunches).length === 0) {
            console.error("❌ Nebyla nalezena žádná obědová data! Pravděpodobně chyba scrapingu.");
            return;
        }

        // 🟢 2. Projdeme všechny dny a přidáme do DB
        for (const [date, data] of Object.entries(lunches)) {
            console.log(` Přidávám do DB: ${date} | Oběd 1: ${data.obed1} | Oběd 2: ${data.obed2} | Polévka: ${data.polevka}`);

            await updateLunches({
                date,
                soup: { name: data.polevka },
                obed1: { name: data.obed1 },
                obed2: { name: data.obed2 }
            });

            console.log(`✅ Uloženo do DB: ${date}`);
        }

        console.log("✅ Obědy byly úspěšně naplněny do DB.");
    } catch (error) {
        console.error("❌ Chyba při naplňování obědů do DB:", error);
    }
}

// 🟢 Spustíme hned
fillLunchDB();