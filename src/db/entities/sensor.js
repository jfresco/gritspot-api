module.exports = function Sensor (attrs) {
  const api = {
    disable: function () {
      attrs.is_allocatable = false
    }
  }

  return Object.assign({ attrs }, api)
}
