const request = require('supertest')
const { expect } = require('chai')
const { times } = require('lodash')

const app = require('../app')
const { Sensors, Workouts } = require('../db')

describe('Workouts endpoints', () => {
  describe('GET /workouts', () => {
    it('gets all workouts', () =>
      request(app)
        .get('/workouts')
        .expect(200)
        .then(response => {
          expect(response.body).to.have.property('workouts').that.is.an('array')
          expect(response.body).not.to.have.property('workouts[0].allocations')
        })
    )
  })

  describe('GET /workout', () => {
    it('gets a single workout', () =>
      request(app)
        .get('/workout/123')
        .expect(200)
        .then(({ body }) => {
          expect(body).to.have.property('workout').that.is.an('object')
          expect(body.workout).to.have.property('id', '123')
          expect(body.workout).to.have.property('allocations').that.is.an('array')
        })
    )

    it('responds with 404 when there is no workout with some ID', () =>
      request(app)
        .get('/workout/7777')
        .expect(404)
        .then(response => {
          expect(response.body).to.have.property('error', 'Not found')
        })
    )

    it('responds with 404 when no ID is provided', () =>
      request(app)
        .get('/workout')
        .expect(404)
    )
  })

  describe('POST /workout/{id}/allocations', () => {
    it('allocates sensors', () => {
      const participants = ['aaa', 'bbb', 'ccc']
      const availableSensors = Sensors.getAllocatable().slice(0, 3).map(s => s.attrs.id)
      return request(app)
        .post('/workout/123/allocations')
        .send({ participants })
        .expect(200)
        .then(({ body }) => {
          // Validate that the response contains the allocations
          expect(body).to.have.nested.property('workout.allocations').that.is.an('array')
          times(3, i => {
            expect(body.workout.allocations[i]).to.have.property('user_id', participants[i])
            expect(body.workout.allocations[i]).to.have.property('sensor_id', availableSensors[i])
          })

          // Validate that the DB holds the same data
          const { attrs } = Workouts.findById('123')
          expect(body.workout).to.deep.equal(attrs)
        })
    })

    it('fails if there are not enough sensors', () => {
      const availableSensors = Sensors.getAllocatable().map(s => s.attrs.id)
      const participants = times(availableSensors.length + 5, i => `user_${i}`)
      return request(app)
        .post('/workout/123/allocations')
        .send({ participants })
        .expect(400)
        .then(({ body }) => {
          expect(body.error.startsWith('Not enough sensors'))
        })
    })
  })
})
