const request = require('supertest')
const { expect } = require('chai')

const app = require('../app')
const { Sensors } = require('../db')

describe('Sensors endpoints', () => {
  describe('PUT /sensor/{id}', () => {
    afterEach(() => {
      Sensors.findById('0809').attrs.is_allocatable = true
    })

    it('disables broken sensors', () =>
      request(app)
        .put('/sensor/0809')
        .send({ is_allocatable: '' })
        .expect(200)
        .then(response => {
          expect(response.body).to.have.nested.property('sensor.id', '0809')
          expect(response.body).to.have.nested.property('sensor.is_allocatable', false)
        })
    )

    it('responds with 404 when the sensor is not found', () =>
      request(app)
        .put('/sensor/08a09')
        .send({ is_allocatable: '' })
        .expect(404)
    )

    it('fails when the sensor is already disabled', () =>
      request(app)
        .put('/sensor/08209')
        .send({ is_allocatable: '' })
        .expect(400)
    )

    it('fails with invalid body', () =>
      request(app)
        .put('/sensor/08209')
        .send({ is_allocatable: false })
        .expect(400)
    )
  })
})
