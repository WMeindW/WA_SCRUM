const axios = require("axios");
const { JSDOM } = require("jsdom");

const URL = "https://strav.nasejidelna.cz/0341/login";

/**
 * @async
 * @function fetchLunches
 * @description Funkce pro načtení jídelníčku z webové stránky.
 * @returns {Promise<object>} Promise, která se vyřeší s objektem obsahujícím jídelníček, nebo s objektem s chybovou zprávou.
 */
async function fetchLunches() {
    try {
        // Načtení HTML obsahu webové stránky pomocí axios
        const response = await axios.get(URL);
        const dom = new JSDOM(response.data);
        const document = dom.window.document;

        let jidelnicek = {};
        let dnyNapocitane = 0;

        // Iterace přes všechny dny v jídelníčku
        document.querySelectorAll(".jidelnicekDen").forEach(den => {
            // Omezení na maximálně 5 dní dopředu
            if (dnyNapocitane >= 5) return;

            let datumRaw = den.querySelector(".jidelnicekTop")?.textContent.trim();
            let polevka = "";
            let obed1 = "";
            let obed2 = "";

            // Iterace přes jednotlivé obědy v daném dni
            den.querySelectorAll(".container").forEach(obed => {
                let lokalita = obed.querySelector(".shrinkedColumn:not(.smallBoldTitle)")?.textContent.trim();
                let druh = obed.querySelector(".smallBoldTitle")?.textContent.trim();
                let jidlo = obed.querySelector(".column")?.textContent.trim();

                // Filtrování pouze pro lokalitu "Ječná"
                if (lokalita === "Ječná") {
                    // Úprava textu jídla (odstranění alergenů, mezer, rozdělení na položky)
                    let jidloPolozky = jidlo
                        .replace(/\s+/g, " ") // Odstraní nadbytečné mezery a nové řádky
                        .replace(/\(.*?\)/g, "") // Odstraní alergeny v závorkách
                        .trim()
                        .split(","); // Rozdělí jídlo podle čárek

                    // Extrakce polévky a obědů
                    if (druh === "Oběd 1" && jidloPolozky.length > 1) {
                        polevka = jidloPolozky[0].trim();
                        obed1 = jidloPolozky.slice(1).join(", ").trim();
                    }
                    if (druh === "Oběd 2" && jidloPolozky.length > 1) {
                        obed2 = jidloPolozky.slice(1).join(", ").trim();
                    }
                }
            });

            // Uložení dat do objektu jídelníčku, pokud jsou k dispozici
            if (polevka || obed1 || obed2) {
                let key = datumRaw;
                jidelnicek[key] = {
                    "polevka": polevka,
                    "obed1": obed1,
                    "obed2": obed2
                };
                dnyNapocitane++; // Počítáme max 5 dní
            }
        });
        console.error("data naplnena");
        return jidelnicek;
    } catch (error) {
        // Zpracování chyb při načítání dat
        console.error("Chyba při načítání dat:", error.message);
        return { error: "Nepodařilo se načíst jídelníček" };
    }
}

module.exports = { fetchLunches };