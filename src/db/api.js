const { Workout } = require('./entities')

module.exports = function (data) {
  const Workouts = {
    all: () => {
      return data.workouts.map(Workout)
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

  return {
    Workouts,
    Sensors
  }
}
