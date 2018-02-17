const data = require('./data.json')

function Workout (attrs) {
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

const Workouts = {
  all: () => {
    return data.workouts
  },

  findById: (id) => {
    const workout = data.workouts.find(w => w.id === id)
    return workout && Workout(workout)
  }
}

const Sensors = {
  all: () => {
    return data.sensors
  },

  findById: (id) => {
    return data.sensors.find(s => s.id === id)
  },

  getAllocatable: () => {
    return data.sensors.filter(s => s.is_allocatable)
  }
}

module.exports = {
  Workouts,
  Sensors
}
