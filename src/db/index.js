const JsonFileStrategy = require('./strategies/json-file-strategy')

// Eventually, more strategies can be added in order to add more data sources (e.g., a database)
module.exports = require('./api')(JsonFileStrategy)
