const {defineAPILoginEndpoints} = require('./login')
const {defineAPIRatingEndpoint} = require('./rate')

function defineAPIEndpoints(app){
    defineAPILoginEndpoints(app);
    defineAPIRatingEndpoint(app);
}
module.exports = {defineAPIEndpoints}