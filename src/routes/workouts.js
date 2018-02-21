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
 * @api {get} /workouts Get all workouts
 * @apiName GetWorkouts
 * @apiGroup Workouts
 *
 * @apiSuccess {Object[]} workouts Workouts without allocations
 * @apiSuccessExample {json} Success-Response
 *  HTTP/1.1 200 OK
 *  {
 *    "workouts": [
 *      { "id": "123" },
 *      { "id": "456" }
 *    ]
 *  }
 *
 */

router.get('/workouts', (req, res) => {
  const workouts = Workouts.all().map(workout => omit(workout, 'allocations'))
  res.send({ workouts })
})

/**
 * @api {get} /workout/:id Get a single workout
 * @apiName GetWorkout
 * @apiGroup Workouts
 *
 * @apiParam {String} id The workout ID
 *
 * @apiSuccess {Object} workout A single workout with its allocations
 * @apiSuccessExample {json} Success-Response
 *  HTTP/1.1 200 OK
 *  {
 *    "workout": {
 *      "id": "123",
 *      "allocations": [
 *        {
 *          "user_id": "pmccartney",
 *          "sensor_id": "0883",
 *          "sensor_is_user_property": true,
 *          "created_at": "2018-02-21T17:27:38.878Z",
 *          "updated_at": "2018-02-21T17:32:31.001Z"
 *        }
 *      ]
 *    }
 *  }
 *
 * @apiError WorkoutNotFound The <code>id</code> of the Workout was not found.
 * @apiErrorExample {json} Error-Response
 *   HTTP/1.1 404 Not Found
 *   {
 *     "error": "Not found"
 *   }
 */

router.get('/workout/:id', fetchWorkout, ({ workout }, res) => res.send({ workout }))

/**
 * @api {post} /workout/:id/allocations Allocates sensors to users in a workout
 * @apiName CreateAllocations
 * @apiGroup Workouts
 *
 * @apiParam {String} id The workout ID
 * @apiParam (body) {String[]} participants An array of user IDs
 *
 * @apiSuccess {Object} workout The resulting workout with the new allocations
 * @apiSuccessExample {json} Success-Response
 *  HTTP/1.1 200 OK
 *  {
 *    "workout": {
 *      "id": "123",
 *      "allocations": [
 *        {
 *          "user_id": "pmccartney",
 *          "sensor_id": "0883",
 *          "sensor_is_user_property": true,
 *          "created_at": "2018-02-21T17:27:38.878Z",
 *          "updated_at": "2018-02-21T17:32:31.001Z"
 *        }
 *      ]
 *    }
 *  }
 *
 * @apiError InsufficientSensors There are no enough available sensors for that users
 * @apiErrorExample {json} Error-Response
 *   HTTP/1.1 400 Bad Request
 *   {
 *     "error": "Not enough sensors"
 *   }
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
 * @api {put} /workout/:id/allocations Modifies allocation for one user
 * @apiDescription Does not change sensor status.
 * @apiName ModifyAllocation
 * @apiGroup Workouts
 *
 * @apiParam {String} id The workout ID
 * @apiParam (body) {String} user_id The user ID
 *
 * @apiSuccess {Object} workout The resulting workout with the new allocation
 * @apiSuccessExample {json} Success-Response
 *  HTTP/1.1 200 OK
 *  {
 *    "workout": {
 *      "id": "123",
 *      "allocations": [
 *        {
 *          "user_id": "pmccartney",
 *          "sensor_id": "0883",
 *          "sensor_is_user_property": true,
 *          "created_at": "2018-02-21T17:27:38.878Z",
 *          "updated_at": "2018-02-21T17:32:31.001Z"
 *        }
 *      ]
 *    }
 *  }
 *
 * @apiError InsufficientSensors There are not enough available sensors
 * @apiErrorExample {json} Error-Response
 *   HTTP/1.1 400 Bad Request
 *   {
 *     "error": "Not enough sensors"
 *   }
 *
 * @apiError UserNotFound User does not participate of this workout
 * @apiErrorExample {json} Error-Response
 *   HTTP/1.1 400 Bad Request
 *   {
 *     "error": "User does not participate in this workout"
 *   }
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

/**
 * @api {post} /workout/:id/allocations/participant Adds a new participant to the workout
 * @apiDescription It allocates him a sensor
 * @apiName AddParticipant
 * @apiGroup Workouts
 *
 * @apiParam {String} id The workout ID
 * @apiParam (body) {String} user_id The user ID
 *
 * @apiSuccess {Object} workout The resulting workout with the new allocation
 * @apiSuccessExample {json} Success-Response
 *  HTTP/1.1 200 OK
 *  {
 *    "workout": {
 *      "id": "123",
 *      "allocations": [
 *        {
 *          "user_id": "pmccartney",
 *          "sensor_id": "0883",
 *          "sensor_is_user_property": true,
 *          "created_at": "2018-02-21T17:27:38.878Z",
 *          "updated_at": "2018-02-21T17:32:31.001Z"
 *        }
 *      ]
 *    }
 *  }
 *
 */

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
