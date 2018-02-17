const express = require('express')
const bodyParser = require('body-parser')
const app = express()

const workouts = require('./routes/workouts')

// Ability to parse JSON payloads
app.use(bodyParser.json())

// Include API endpoints
app.use(workouts)

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
