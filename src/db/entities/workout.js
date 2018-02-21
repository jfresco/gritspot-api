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
    },

    reassign: function (userId, sensorId) {
      attrs.allocations = attrs.allocations.map(a => Object.assign(a, {
        sensor_id: a.user_id === userId
          ? sensorId
          : a.sensor_id
      }))
    },

    addParticipant: function (userId, sensorId, isOwner) {
      const now = new Date().toISOString()
      attrs.allocations.push({
        user_id: userId,
        sensor_id: sensorId,
        sensor_is_user_property: isOwner,
        created_at: now
      })
    },

    getUsedSensorIds: function () {
      return attrs.allocations.map(a => a.sensor_id)
    },

    removeAllocations: function () {
      attrs.allocations = []
    }
  }

  return Object.assign({ attrs }, api)
}
