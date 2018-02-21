const express = require('express')
const { omit } = require('lodash')
const router = express.Router()

const { Workouts, Sensors } = require('../db')
const { allocateSensors, reassignSensor } = require('../controllers')

function fetchWorkout (req, res, next) {
  const workout = Workouts.findById(req.params.id)
  if (!workout) {
    return res.status(404).send({ error: 'Not found' })
  }

  req.workout = workout
  next()
}

/**
 * GET /workouts
 *
 * Returns all workouts without allocations.
 *
 * @return {json} Something with this shape: `{ "workouts": [{ "id": "123" }, { "id": "456" }] }`
 */

router.get('/workouts', (req, res) => {
  const workouts = Workouts.all().map(workout => omit(workout, 'allocations'))
  res.send({ workouts })
})

/**
 * GET /workout/{id}
 *
 * Returns a single workout with all its attributes.
 *
 * @param {string} id - A workout ID
 * @return {json} Something with this shape: `{ "workout": { "id": "123", "allocations": [] } }`
 */

router.get('/workout/:id', fetchWorkout, ({ workout }, res) => res.send({ workout }))

/**
 * POST /workout/{id}/allocations
 *
 * Allocates sensors to users in a given workout. The `allocations` attribute gets populated with `Allocation`
 * objects. If there is not enough sensors, it will fail and respond with HTTP status code 400.
 *
 * @param {string} id - A workout ID
 * @param {string[]} body.participants - Array of User IDs
 * @return {json} The resulting `Workout`
 */

router.post('/workout/:id/allocations', fetchWorkout, ({ io, workout, body: { participants } }, res) => {
  try {
    allocateSensors(workout.id, participants)

    io.emit('allocation', { workout })
    res.send({ workout })
  } catch (e) {
    if (e.code === 'INSUFFICIENT_SENSORS') {
      return res.status(400).send({ error: 'Not enough sensors' })
    }
    throw e
  }
})

/**
 * PUT /workout/{id}/allocations
 *
 * Modifies allocation for one user. Returns 400 if there are no sensors available. Does not disable sensor.
 *
 * @param {string} id - A workout ID
 * @param {string} body.user_id - User ID
 * @return {json} The resulting `Workout`
 */

router.put('/workout/:id/allocations', fetchWorkout, ({ io, workout, body: { user_id: userId } }, res) => {
  try {
    const sensorId = reassignSensor(workout.id, userId)

    // Push notification to subscribed clients
    io.emit('sensor-reassignment', {
      workout_id: workout.id,
      allocation: {
        user_id: userId,
        sensor_id: sensorId
      }
    })

    // Respond request with the workout attributes
    res.send({ workout })
  } catch (err) {
    if (err.code === 'INSUFFICIENT_SENSORS' || err.code === 'USER_IS_NOT_PARTICIPANT') {
      return res.status(400).send({ error: err.message })
    }

    throw err
  }
})

router.post('/workout/:id/allocations/participant', fetchWorkout, ({ io, workout, body: { user_id: userId } }, res) => {
  const sensor = Sensors.getAllocatableForUser(userId)
  if (!sensor) {
    return res.status(400).send({ error: 'Not enough sensors' })
  }

  Workouts.addParticipant(workout.id, userId, sensor.id, sensor.owner_id === userId)

  io.emit('participant-added', {
    allocation: {
      user_id: userId,
      sensor_id: sensor.id
    }
  })

  res.send({ workout })
})

module.exports = router
