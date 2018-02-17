module.exports = function Workout (attrs) {
  const api = {
    allocate: function (participants, sensors) {
      // Previous allocations are overriden
      attrs.allocations = participants.map((userId, i) => {
        return {
          user_id: userId,
          sensor_id: sensors[i],
          sensor_is_user_property: false, // TODO
          created_at: new Date().toISOString()
        }
      })
    }
  }

  return Object.assign({ attrs }, api)
}
