const { Sensors, Workouts } = require('../../db')

const notUsedIn = workoutId => sensor => !Workouts.getUsedSensorIds(workoutId).includes(sensor.id)
const notOwnedBy = userId => s => !s.owner_id || s.owner_id === userId

module.exports = function reassignSensor (workoutId, userId) {
  const workout = Workouts.findById(workoutId)
  const participantIds = workout.allocations.map(a => a.user_id)

  if (!participantIds.includes(userId)) {
    const err = new Error('User does not participate in this workout')
    err.code = 'USER_IS_NOT_PARTICIPANT'
    throw err
  }

  // Get available sensors (that are allocatable, not used in the current workout, and not owned)
  const sensors = Sensors.getAllocatable()
    .filter(notUsedIn(workout.id))
    .filter(notOwnedBy(userId))
    .map(s => s.id)

  if (sensors.length === 0) {
    const err = new Error('Not enough sensors')
    err.code = 'INSUFFICIENT_SENSORS'
    throw err
  }

  // Grab the first sensor in the list
  const sensorId = sensors[0]

  // Commit reassignment
  Workouts.reassign(workout.id, userId, sensorId)

  return sensorId
}
