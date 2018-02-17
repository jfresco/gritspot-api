const request = require('supertest')
const { expect } = require('chai')

const app = require('../src/app')

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
})
