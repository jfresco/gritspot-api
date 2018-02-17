const express = require('express')
const bodyParser = require('body-parser')
const app = express()

// Ability to parse JSON payloads
app.use(bodyParser.json())

app.get('/workouts', (req, res) => {
  res.send({ result: 'ok' })
})

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
