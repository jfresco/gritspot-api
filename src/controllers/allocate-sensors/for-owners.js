const isOwnerOfSome = sensors => participantId => sensors.map(s => s.owner_id).includes(participantId)
const hasOwner = sensor => !!sensor.owner_id
const byOwner = id => s => s.owner_id === id

/**
 * Gets a list of allocations for participants that are owners of sensors
 *
 * @access private
 * @param {string[]} participants A list of participants
 * @param {Object[]} sensors A list of Sensor objects
 * @return {Object[]} Allocations participants who owes sensors (other participants are ignored)
 */

module.exports = function getAllocationsForOwners (participants, sensors) {
  const reservedSensors = sensors.filter(hasOwner)
  const owners = participants.filter(isOwnerOfSome(reservedSensors))

  return owners.map(userId => ({
    user_id: userId,
    sensor_id: reservedSensors.find(byOwner(userId)).id,
    sensor_is_user_property: true
  }))
}
