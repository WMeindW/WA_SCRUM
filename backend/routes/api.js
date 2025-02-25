const {defineAPILoginEndpoints} = require('./login')
const {defineAPIRatingEndpoint} = require('./rate')
const {defineLunchEndpoints} = require("./lunches");

function defineAPIEndpoints(app){
    defineAPILoginEndpoints(app);
    defineAPIRatingEndpoint(app);
    defineLunchEndpoints(app);
}
module.exports = {defineAPIEndpoints}