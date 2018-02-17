const express = require('express')
const { omit } = require('lodash')
const router = express.Router()
const { Workouts, Sensors } = require('../db')

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
  const workouts = Workouts.all().map(({ attrs }) => omit(attrs, 'allocations'))
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

router.get('/workout/:id', fetchWorkout, ({ workout }, res) => res.send({ workout: workout.attrs }))

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

router.post('/workout/:id/allocations', fetchWorkout, ({ workout, body: { participants } }, res) => {
  const sensors = Sensors.getAllocatable()
  try {
    workout.allocate(participants, sensors)
    res.send({ workout: workout.attrs })
  } catch (e) {
    if (e.code === 'INSUFFICIENT_SENSORS') {
      return res.status(400).send({ error: 'Not enough sensors' })
    }
    throw e
  }
})

module.exports = router
