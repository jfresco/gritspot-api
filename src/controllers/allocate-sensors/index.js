const { Sensors, Workouts } = require('../../db')
const getAllocationsForOwners = require('./for-owners')
const getAllocationsForNotOwners = require('./for-not-owners')
const timestamp = require('./timestamp')

/**
 * Allocates sensors to participants in a workout
 *
 * @param {string} workoutId The ID of a workout
 * @param {string[]} participants List of participants
 * @throws {Error} Throws error if there are no sensors available
 */

module.exports = function allocateSensors (workoutId, participants) {
  const sensors = Sensors.getAllocatable()

  const allocations = [
    ...getAllocationsForOwners(participants, sensors),
    ...getAllocationsForNotOwners(participants, sensors)
  ]

  // Commit transaction
  Workouts.allocate(workoutId, timestamp(allocations))
}
