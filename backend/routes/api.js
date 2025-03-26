const {defineAPILoginEndpoints} = require('./login')  // Importuje funkci pro definování API endpointů pro přihlášení
const {defineAPIRatingEndpoint} = require('./rate')  // Importuje funkci pro definování API endpointu pro hodnocení jídel
const {defineLunchEndpoints} = require("./lunches");  // Importuje funkci pro definování API endpointů souvisejících s obědy
const  {defineAPIStatisticsEndpoint} = require("./statistics")  // Importuje funkci pro definování API endpointu pro statistiky
const { runLunchUpdate } = require("../utils/cron");  // Importuje funkci pro pravidelnou aktualizaci obědového menu

/**
 * Funkce pro definování všech API endpointů aplikace.
 * @param {Object} app - Express aplikace, do které se registrují endpointy
 */
function defineAPIEndpoints(app){
    defineAPILoginEndpoints(app);  // Registruje endpointy pro přihlášení
    defineAPIRatingEndpoint(app);  // Registruje endpoint pro hodnocení jídel
    defineLunchEndpoints(app);  // Registruje endpointy související s obědy
    defineAPIStatisticsEndpoint(app);  // Registruje endpoint pro statistiky
    runLunchUpdate();  // Spustí pravidelnou aktualizaci obědového menu
}

module.exports = {defineAPIEndpoints};  // Exportuje funkci pro použití v jiných částech aplikace
