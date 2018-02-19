const express = require('express')
const bodyParser = require('body-parser')
const app = express()

// Enhance server with real-time features
const server = require('http').Server(app)
const io = require('socket.io')(server)

// Serve static files
app.use(express.static('src/static'))

// Make `socket.io` instance available on all middlewares
app.use((req, res, next) => {
  req.io = io
  next()
})

const workouts = require('./routes/workouts')
const sensors = require('./routes/sensors')

// Ability to parse JSON payloads
app.use(bodyParser.json())

// Include API endpoints
app.use(workouts)
app.use(sensors)

// Handle not found endpoints
app.use((req, res) => {
  res.status(404).send({ error: 'Not found' })
})

// Handle errors
app.use((error, req, res, next) => {
  console.log(error)
  res.status(500).send({ error: 'Server error' })
})

module.exports = server
