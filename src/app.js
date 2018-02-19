const express = require('express')
const bodyParser = require('body-parser')
const app = express()

// Serve static files
app.use(express.static('src/static'))

// Enhance server with real-time features
const server = require('./ws')(app)

// Ability to parse JSON payloads
app.use(bodyParser.json())

// Include API endpoints
app.use(require('./routes/workouts'))
app.use(require('./routes/sensors'))

// Handle not found endpoints
app.use(require('./routes/not-found'))

// Handle errors
app.use(require('./routes/error'))

module.exports = server
