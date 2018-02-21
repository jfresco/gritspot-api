const isNotOwnerOfAny = sensors => participantId => !sensors
  .filter(s => s.owner_id)
  .map(s => s.owner_id)
  .includes(participantId)

const hasNoOwner = sensor => !sensor.owner_id

/**
 * Gets a list of allocations for participants that are owners of sensors
 *
 * @access private
 * @param {string[]} participants A list of participants
 * @param {Object[]} sensors A list of Sensor objects
 * @return {Object[]} Allocations participants who don't owe sensors (other participants are ignored)
 * @throws {Error} Throws an error if there are not enough sensors to allocate
 */

module.exports = function getAllocationsForNotOwners (participants, sensors) {
  const notReservedSensors = sensors.filter(hasNoOwner)
  const notOwners = participants.filter(isNotOwnerOfAny(sensors))

  if (notOwners.length > notReservedSensors.length) {
    const err = new Error('Not enough sensors')
    err.code = 'INSUFFICIENT_SENSORS'
    throw err
  }

  return notOwners.map((ownerId, i) => ({
    user_id: ownerId,
    sensor_id: notReservedSensors[i].id,
    sensor_is_user_property: false
  }))
}
