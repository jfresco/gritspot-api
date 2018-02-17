module.exports = function Workout (attrs) {
  const api = {
    allocate: function (participants, sensors) {
      const now = new Date().toISOString()

      // Allocate owners first
      const reservedSensors = sensors.filter(s => s.attrs.owner_id)
      const owners = participants.filter(p => reservedSensors.map(s => s.attrs.owner_id).includes(p))
      let allocations = owners.map(ownerId => ({
        user_id: ownerId,
        sensor_id: reservedSensors.find(s => s.attrs.owner_id === ownerId).attrs.id,
        sensor_is_user_property: true,
        created_at: now
      }))

      // Allocate non-owners to not-owned sensors
      const notReservedSensors = sensors.filter(s => !s.attrs.owner_id)
      const notOwners = participants.filter(p => !reservedSensors.map(s => s.attrs.owner_id).includes(p))

      if (notOwners.length > notReservedSensors.length) {
        const err = new Error('Not enough sensors')
        err.code = 'INSUFFICIENT_SENSORS'
        throw err
      }

      allocations = allocations.concat(notOwners.map((ownerId, i) => ({
        user_id: ownerId,
        sensor_id: notReservedSensors[i].attrs.id,
        sensor_is_user_property: false,
        created_at: now
      })))

      // Commit transaction
      attrs.allocations = allocations
    }
  }

  return Object.assign({ attrs }, api)
}
