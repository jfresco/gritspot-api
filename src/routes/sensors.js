const express = require('express')
const router = express.Router()
const { Sensors } = require('../db')

/**
 * @api {put} /sensor/:id Modifies sensor status
 * @apiName ModifySensor
 * @apiGroup Sensors
 *
 * @apiParam {String} id The sensor ID
 * @apiParam (body) {Boolean} is_allocatable The new allocatable status. For the moment it only accepts falsey values, it means that a client can only disable sensors.
 *
 * @apiSuccess {Object} sensor The resulting Sensor entity
 * @apiSuccessExample {json} Success-Response
 *  HTTP/1.1 200 OK
 *  {
 *    "sensor": {
 *      "id": "abc1234",
 *      "is_allocatable": false
 *    }
 *  }
 *
 * @apiError SensorNotFound The <code>id</code> of the Sensor was not found.
 * @apiErrorExample {json} Error-Response
 *   HTTP/1.1 404 Not Found
 *   {
 *     "error": "Not found"
 *   }
 *
 * @apiError SensorAlreadyDisabled The Sensor is already disabled.
 * @apiErrorExample {json} Error-Response
 *   HTTP/1.1 400 Bad Request
 *   {
 *     "error": "The sensor is already disabled"
 *   }
 *
 * @apiError InvalidFields The field `is_allocatable` has an invalid value or has not been provided
 * @apiErrorExample {json} Error-Response
 *   HTTP/1.1 400 Bad Request
 *   {
 *     "error": "`is_allocatable` is required and should be falsey"
 *   }
 */

router.put('/sensor/:id', (req, res) => {
  const sensor = Sensors.findById(req.params.id)
  if (!sensor) {
    return res.status(404).send({ error: 'Not found' })
  }

  if (!sensor.is_allocatable) {
    return res.status(400).send({ error: 'The sensor is already disabled' })
  }

  // The field `is_allocatable` should be present and its value should be falsey (i.e., empty string)
  if (!req.body.hasOwnProperty('is_allocatable') || req.body.is_allocatable) {
    return res.status(400).send({ error: '`is_allocatable` is required and should be falsey' })
  }

  Sensors.disable(sensor.id)

  req.io.emit('sensor-disabled', { sensor })
  res.send({ sensor })
})

module.exports = router
