const cron = require("node-cron");
const { fetchLunches } = require("./fetchLunches");
const { updateLunches } = require("./updateLunches");

// Funkce pro aktualizaci obědů
async function runLunchUpdate() {
    console.log("📢 Kontrola nových obědů...");

    // Načteme jídelníček (max 5 dní dopředu)
    const lunches = await fetchLunches();

    // Projdeme všechny dny a přidáme je do databáze
    for (const [date, data] of Object.entries(lunches)) {
        await updateLunches({
            date,
            soup: { name: data.polevka },
            obed1: { name: data.obed1 },
            obed2: { name: data.obed2 }
        });
    }

    console.log("✅ Denní aktualizace jídelníčku dokončena.");
}

// Automatické spouštění v 6:00 ráno každý den
cron.schedule("0 6 * * *", runLunchUpdate);

// Pokud spustíš tento soubor manuálně (`node cron.js`), rovnou se aktualizují obědy
if (require.main === module) {
    runLunchUpdate();
}
