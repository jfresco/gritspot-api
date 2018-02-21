module.exports = function (repository) {
  const Workouts = {
    all: () => {
      return repository.getAllWorkouts()
    },

    findById: (id) => {
      return repository.getWorkoutById(id)
    },

    allocate: (workoutId, participants) => {
      return repository.setAllocations(workoutId, participants)
    },

    reassign: function (workoutId, userId, sensorId) {
      return repository.reassignSensor(workoutId, userId, sensorId)
    },

    addParticipant: function (workoutId, userId, sensorId, isOwner) {
      return repository.addParticipantToWorkout(workoutId, userId, sensorId, isOwner)
    },

    getUsedSensorIds: function (workoutId) {
      const workout = this.findById(workoutId)
      return workout.allocations.map(a => a.sensor_id)
    },

    clearAllocations: function (workoutId) {
      return repository.setAllocations(workoutId, [])
    }
  }

  const Sensors = {
    all: () => {
      return repository.getAllSensors()
    },

    findById: (id) => {
      return repository.getSensorById(id)
    },

    getAllocatable: () => {
      return repository.getAllocatableSensors()
    },

    getAllocatableForUser: userId => {
      return repository.getAllocatableSensorForUser(userId)
    },

    disable: sensorId => {
      return repository.disableSensor(sensorId)
    }
  }

  return {
    Workouts,
    Sensors
  }
}
