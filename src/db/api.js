module.exports = function (repository) {
  const Workouts = {

    /**
     * Gets all workouts
     *
     * @return {Object[]} A list of Workout objects
     */

    all: () => {
      return repository.getAllWorkouts()
    },

    /**
     * Get a single Workout object or `undefined` if there are no workout with this ID
     *
     * @param {string} id The ID of the Workout
     * @return {Object} The Workout object
     */

    findById: (id) => {
      return repository.getWorkoutById(id)
    },

    /**
     * Set allocations in a Workout
     *
     * @param {string} id The ID of the Workout
     * @param {Object[]} allocations The allocations to set to the Workout
     * @throws {Error} Throw an error if no workout is found with this ID
     */

    allocate: (workoutId, allocations) => {
      repository.setAllocations(workoutId, allocations)
    },

    /**
     * Set a new Sensor to a user in a Workout allocation. The `updated_at` field of the allocation is updated with the current timestamp
     *
     * @param {string} workoutId The ID of the Workout
     * @param {string} userId The ID of the User
     * @param {string} sensorId The ID of the Sensor
     * @throws {Error} Throw an error if no workout is found with this ID or if the user is not assigned
     */

    reassign: function (workoutId, userId, sensorId) {
      return repository.reassignSensor(workoutId, userId, sensorId)
    },

    /**
     * Adds a new participant to a Workout
     *
     * @param {string} workoutId The ID of the Workout
     * @param {string} userId The ID of the User
     * @param {string} sensorId The ID of the Sensor
     * @param {boolean} isOwner A flag that indicates if the user is owner of the sensor
     * @throws {Error} Throw an error if no workout is found
     */

    addParticipant: function (workoutId, userId, sensorId, isOwner) {
      return repository.addParticipantToWorkout(workoutId, userId, sensorId, isOwner)
    },

    /**
     * Gets the IDs of the sensors used in the Workout
     *
     * @param {string} workoutId The ID of the Workout
     * @return {string[]} A list of sensors used in the workout
     * @throws {Error} Throw an error if no workout is found with this ID
     */

    getUsedSensorIds: function (workoutId) {
      const workout = this.findById(workoutId)
      return workout.allocations.map(a => a.sensor_id)
    },

    /**
     * Remove allocations for a Workout
     *
     * @param {string} workoutId The ID of the Workout
     * @throws {Error} Throw an error if no workout is found with this ID
     */

    clearAllocations: function (workoutId) {
      repository.setAllocations(workoutId, [])
    }
  }

  const Sensors = {
    /**
     * Gets all sensors
     *
     * @return {Object[]} A list of Sensor objects
     */

    all: () => {
      return repository.getAllSensors()
    },

    /**
     * Get a single Sensor object or `undefined` if there are no Sensor with this ID
     *
     * @param {string} id The ID of the Sensor
     * @return {Object} The Sensor object
     */

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
