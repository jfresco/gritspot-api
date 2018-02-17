const express = require('express')
const router = express.Router()
const { Sensors } = require('../db')

/**
 * PUT /sensor/{id}
 *
 * Modifies sensor status
 *
 * @param {string} id - Sensor ID
 * @param {boolean} body.is_allocatable - The new allocatable status. For the moment it only accepts falsey
 * values, it means that a client can only disable sensors.
 * @return {json} The resulting `Sensor` entity
 */

router.put('/sensor/:id', (req, res) => {
  const sensor = Sensors.findById(req.params.id)
  if (!sensor) {
    return res.status(404).send({ error: 'Not found' })
  }

  if (!sensor.attrs.is_allocatable) {
    return res.status(400).send({ error: 'The sensor is already disabled' })
  }

  // The field `is_allocatable` should be present and its value should be falsey (i.e., empty string)
  if (!req.body.hasOwnProperty('is_allocatable') || req.body.is_allocatable) {
    return res.status(400).send({ error: '`is_allocatable` is required and should be falsey' })
  }

  sensor.disable()
  res.send({ sensor: sensor.attrs })
})

module.exports = router
