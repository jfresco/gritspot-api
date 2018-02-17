const data = require('./data.json')

const Workouts = {
  all: () => {
    return data.workouts
  },

  findById: (id) => {
    return data.workouts.find(w => w.id === id)
  }
}

module.exports = {
  Workouts
}
