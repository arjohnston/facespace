const fs = require('fs')
const path = require('path')

// If there is a file at config.json,
// then read it and return it
const config = fs.readFileSync(path.resolve(__dirname, '../api/config/config.json'))

// Export the configuration file
module.exports = JSON.parse(config)
