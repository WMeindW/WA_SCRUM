const cron = require("node-cron");
const { fetchLunches } = require("./fetchLunches");
const { updateLunches } = require("./updateLunches");

/**
 * @async
 * @function runLunchUpdate
 * @description Funkce pro aktualizaci obědů. Získává data z externího zdroje pomocí `fetchLunches` a aktualizuje databázi pomocí `updateLunches`.
 * @returns {Promise<void>} Promise, která se vyřeší po dokončení aktualizace obědů.
 */
async function runLunchUpdate() {
    console.log(" Kontrola nových obědů...");

    // Získání dat obědů z externího zdroje
    const lunches = await fetchLunches();

    // Iterace přes získaná data a aktualizace databáze pro každý den
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

/**
 * @function cron.schedule
 * @description Automatické spouštění funkce `runLunchUpdate` každý den v 6:00.
 * @param {string} "0 6 * * *" Cron výraz pro spuštění v 6:00 každý den.
 * @param {function} runLunchUpdate Funkce, která se má spustit.
 */
cron.schedule("0 6 * * *", runLunchUpdate);

/**
 * @description Pokud je tento soubor spuštěn přímo (ne importován jako modul), spustí funkci `runLunchUpdate` manuálně.
 * To se používá pro testování nebo manuální aktualizaci obědů.
 */
if (require.main === module) {
    console.log(" Manuální spuštění cron jobu...");
    runLunchUpdate().catch(console.error);
}

module.exports = { runLunchUpdate };