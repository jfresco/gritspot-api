const { Workout, Sensor } = require('./entities')

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
      return data.sensors.map(Sensor)
    },

    findById: (id) => {
      const sensor = data.sensors.find(s => s.id === id)
      return sensor && Sensor(sensor)
    },

    getAllocatable: () => {
      return data.sensors.filter(s => s.is_allocatable).map(Sensor)
    }
  }

  return {
    Workouts,
    Sensors
  }
}
