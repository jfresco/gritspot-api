const { Sensors, Workouts } = require('../db')

function allocateSensors (workoutId, participants) {
  const now = new Date().toISOString()
  const sensors = Sensors.getAllocatable()

  // Allocate owners first
  const reservedSensors = sensors.filter(s => s.owner_id)
  const owners = participants.filter(p => reservedSensors.map(s => s.owner_id).includes(p))
  let allocations = owners.map(ownerId => ({
    user_id: ownerId,
    sensor_id: reservedSensors.find(s => s.owner_id === ownerId).id,
    sensor_is_user_property: true,
    created_at: now
  }))

  // Allocate non-owners to not-owned sensors
  const notReservedSensors = sensors.filter(s => !s.owner_id)
  const notOwners = participants.filter(p => !reservedSensors.map(s => s.owner_id).includes(p))

  if (notOwners.length > notReservedSensors.length) {
    const err = new Error('Not enough sensors')
    err.code = 'INSUFFICIENT_SENSORS'
    throw err
  }

  allocations = allocations.concat(notOwners.map((ownerId, i) => ({
    user_id: ownerId,
    sensor_id: notReservedSensors[i].id,
    sensor_is_user_property: false,
    created_at: now
  })))

  // Commit transaction
  Workouts.allocate(workoutId, allocations)
}

module.exports = {
  allocateSensors
}
