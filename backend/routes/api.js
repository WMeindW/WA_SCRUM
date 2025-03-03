const {defineAPILoginEndpoints} = require('./login')
const {defineAPIRatingEndpoint} = require('./rate')
const {defineLunchEndpoints} = require("./lunches");
const  {defineAPIStatisticsEndpoint} = require("./statistics")

function defineAPIEndpoints(app){
    defineAPILoginEndpoints(app);
    defineAPIRatingEndpoint(app);
    defineLunchEndpoints(app);
    defineAPIStatisticsEndpoint(app);
}
module.exports = {defineAPIEndpoints};