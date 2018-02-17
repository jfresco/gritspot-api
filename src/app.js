const express = require('express')
const bodyParser = require('body-parser')
const app = express()

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

module.exports = app
