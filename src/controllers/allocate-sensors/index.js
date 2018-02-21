const { Sensors, Workouts } = require('../../db')
const getAllocationsForOwners = require('./for-owners')
const getAllocationsForNotOwners = require('./for-not-owners')
const timestamp = require('./timestamp')

module.exports = function allocateSensors (workoutId, participants) {
  const sensors = Sensors.getAllocatable()

  const allocations = [
    ...getAllocationsForOwners(participants, sensors),
    ...getAllocationsForNotOwners(participants, sensors)
  ]

  // Commit transaction
  Workouts.allocate(workoutId, timestamp(allocations))
}
