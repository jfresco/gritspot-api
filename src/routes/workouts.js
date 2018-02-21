const express = require('express')
const { omit } = require('lodash')
const router = express.Router()
const { Workouts, Sensors } = require('../db')
const { allocateSensors } = require('../controllers')

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

router.put('/workout/:id/allocations', fetchWorkout, (req, res) => {
  const { user_id: userId } = req.body
  const participantIds = req.workout.allocations.map(a => a.user_id)

  if (!participantIds.includes(userId)) {
    return res.status(400).send({ error: 'User does not participate in this workout' })
  }

  const usedSensorIds = Workouts.getUsedSensorIds(req.workout.id)
  const notUsed = s => !usedSensorIds.includes(s.id)
  const notOwned = s => !s.owner_id || s.owner_id === userId

  // Get available sensors (that are allocatable, not used in the current workout, and not owned)
  const sensors = Sensors.getAllocatable()
    .filter(notUsed)
    .filter(notOwned)
    .map(s => s.id)

  if (sensors.length === 0) {
    return res.status(400).send({ error: 'Not enough sensors' })
  }

  // Grab the first sensor in the list
  const sensorId = sensors[0]

  // Commit reassignment
  Workouts.reassign(req.workout.id, userId, sensorId)

  // Push notification to subscribed clients
  req.io.emit('sensor-reassignment', {
    workout_id: req.workout.id,
    allocation: {
      user_id: userId,
      sensor_id: sensorId
    }
  })

  // Respond request with the workout attributes
  res.send({ workout: req.workout })
})

router.post('/workout/:id/allocations/participant', fetchWorkout, (req, res) => {
  const { user_id: userId } = req.body
  const sensor = Sensors.getAllocatableForUser(userId)
  if (!sensor) {
    return res.status(400).send({ error: 'Not enough sensors' })
  }

  Workouts.addParticipant(req.workout.id, userId, sensor.id, sensor.owner_id === userId)

  req.io.emit('participant-added', {
    allocation: {
      user_id: userId,
      sensor_id: sensor.id
    }
  })

  res.send({ workout: req.workout })
})

module.exports = router
