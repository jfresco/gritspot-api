const isOwnerOfSome = sensors => participantId => sensors.map(s => s.owner_id).includes(participantId)
const hasOwner = sensor => !!sensor.owner_id
const byOwner = id => s => s.owner_id === id

module.exports = function getAllocationsForOwners (participants, sensors) {
  const reservedSensors = sensors.filter(hasOwner)
  const owners = participants.filter(isOwnerOfSome(reservedSensors))

  return owners.map(userId => ({
    user_id: userId,
    sensor_id: reservedSensors.find(byOwner(userId)).id,
    sensor_is_user_property: true
  }))
}
