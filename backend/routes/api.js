const {defineAPILoginEndpoints} = require('./login')
const {defineAPIRatingEndpoint} = require('./rate')
const {defineLunchEndpoints} = require("./lunches");
const  {defineAPIStatisticsEndpoint} = require("./statistics")
const { runLunchUpdate } = require("../utils/cron");

function defineAPIEndpoints(app){
    defineAPILoginEndpoints(app);
    defineAPIRatingEndpoint(app);
    defineLunchEndpoints(app);
    defineAPIStatisticsEndpoint(app);
    runLunchUpdate();
}
module.exports = {defineAPIEndpoints};