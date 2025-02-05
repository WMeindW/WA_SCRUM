const {defineAPILoginEndpoints} = require('./login')

function defineAPIEndpoints(app){
defineAPILoginEndpoints(app)
}
module.exports = {defineAPIEndpoints}