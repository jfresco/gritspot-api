const data = require('./data.json')

function getWorkoutById (id) {
  return data.workouts.find(workout => workout.id === id)
}

module.exports = {
  getAllWorkouts: function () {
    return data.workouts
  },

  getWorkoutById,

  setAllocations: function (workoutId, allocations) {
    const workout = getWorkoutById(workoutId)
    workout.allocations = allocations
  },

  getAllSensors: function () {
    return data.sensors
  },

  getSensorById: function (id) {
    return data.sensors.find(s => s.id === id)
  },

  getAllocatableSensors: function () {
    return data.sensors.filter(s => s.is_allocatable)
  },

  getAllocatableSensorForUser: function (userId) {
    const ownedSensor = data.sensors.find(s => s.owner_id === userId)
    if (ownedSensor) {
      return ownedSensor
    }

    const sensors = data.sensors.filter(s => s.is_allocatable)
    return sensors.length > 0
      ? sensors[0]
      : undefined
  },

  disableSensor: function (sensorId) {
    const sensor = data.sensors.find(s => s.id === sensorId)
    if (!sensor) {
      throw new Error('Sensor not found')
    }

    sensor.is_allocatable = false
  },

  reassignSensor: function (workoutId, userId, sensorId) {
    const workout = getWorkoutById(workoutId)
    const allocation = workout.allocations.find(a => a.user_id === userId)
    allocation.sensor_id = sensorId
  },

  addParticipantToWorkout: function (workoutId, userId, sensorId, isOwner) {
    const now = new Date().toISOString()
    const workout = getWorkoutById(workoutId)
    workout.allocations.push({
      user_id: userId,
      sensor_id: sensorId,
      sensor_is_user_property: isOwner,
      created_at: now
    })
  }
}
