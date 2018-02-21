const isNotOwnerOfAny = sensors => participantId => !sensors
  .filter(s => s.owner_id)
  .map(s => s.owner_id)
  .includes(participantId)

const hasNoOwner = sensor => !sensor.owner_id

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
