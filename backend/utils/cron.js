const cron = require("node-cron");
const { fetchLunches } = require("./fetchLunches");
const { updateLunches } = require("./updateLunches");

// 🟢 Funkce pro aktualizaci obědů
async function runLunchUpdate() {
    console.log("📢 Kontrola nových obědů...");

    const lunches = await fetchLunches();

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

// 🕕 Automatické spouštění každý den v 6:00
cron.schedule("0 6 * * *", runLunchUpdate);

// 🟢 Pokud je cron.js spuštěn ručně, NESPUSŤ cron (jen exportuj funkci)
if (require.main === module) {
    console.log("🚀 Manuální spuštění cron jobu...");
    runLunchUpdate().catch(console.error);
}

module.exports = { runLunchUpdate };
