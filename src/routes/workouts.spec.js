const request = require('supertest')
const { expect } = require('chai')
const { times } = require('lodash')

const app = require('../app')
const { Sensors, Workouts } = require('../db')

describe('Workouts endpoints', () => {
  afterEach(() => {
    Workouts.findById('123').removeAllocations()
  })

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

  describe('PUT /workout/{id}/allocations', () => {
    it('modifies user allocation', async () => {
      const participants = ['aaa', 'bbb', 'ccc']

      await request(app)
        .post('/workout/123/allocations')
        .send({ participants })
        .expect(200)

      const before = Workouts.findById('123').attrs.allocations.map(a => a.sensor_id)

      const { body } = await request(app)
        .put('/workout/123/allocations')
        .send({ user_id: 'bbb' })
        .expect(200)

      const after = Workouts.findById('123').attrs.allocations.map(a => a.sensor_id)

      // Validate response
      expect(body.workout.allocations[0].sensor_id).to.equal(after[0])
      expect(body.workout.allocations[1].sensor_id).to.equal(after[1])
      expect(body.workout.allocations[2].sensor_id).to.equal(after[2])

      // Validate data consistency
      expect(before[0]).to.equal(after[0])
      expect(before[1]).to.not.equal(after[1])
      expect(before[2]).to.equal(after[2])
    })

    it('fails if user has no allocation', async () => {
      const participants = ['aaa', 'bbb', 'ccc']

      await request(app)
        .post('/workout/123/allocations')
        .send({ participants })
        .expect(200)

      return request(app)
        .put('/workout/123/allocations')
        .send({ user_id: 'xxx' })
        .expect(400)
    })

    it('fails if there are not enough sensors', async () => {
      const participants = ['aaa', 'bbb', 'ccc', 'xxx']

      await request(app)
        .post('/workout/123/allocations')
        .send({ participants })
        .expect(200)

      return request(app)
        .put('/workout/123/allocations')
        .send({ user_id: 'bbb' })
        .expect(400)
    })
  })

  describe('POST /workout/{id}/allocations/participant', () => {
    it('adds a new participant', async () => {
      await request(app)
        .post('/workout/123/allocations')
        .send({ participants: ['aaa', 'bbb', 'ccc'] })
        .expect(200)

      const { body } = await request(app)
        .post('/workout/123/allocations/participant')
        .send({ user_id: 'ddd' })
        .expect(200)

      const participants = body.workout.allocations.map(a => a.user_id)
      expect(participants.includes('ddd'))
    })
  })

  describe('POST /workout/{id}/allocations', () => {
    it('allocates sensors', () => {
      const participants = ['aaa', 'bbb', 'ccc']
      const availableSensors = Sensors.getAllocatable()
        .filter(s => !s.attrs.owner_id)
        .slice(0, 3)
        .map(s => s.attrs.id)

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

    it('allocates sensors to owners and non-owners', () => {
      const participants = ['rstarr', 'sam', 'pmaccartney', 'max', 'jlennon']

      return request(app)
        .post('/workout/48582/allocations')
        .send({ participants })
        .expect(200)
        .then(({ body }) => {
          // Validate that the response contains the allocations
          expect(body).to.have.nested.property('workout.allocations').that.is.an('array')
          expect(body.workout.allocations.some(a => a.sensor_id === '55' && a.user_id === 'max'))
          expect(body.workout.allocations.some(a => a.sensor_id === '13' && a.user_id === 'sam'))

          // Validate that the DB holds the same data
          const { attrs } = Workouts.findById('48582')
          expect(body.workout).to.deep.equal(attrs)
        })
    })

    it('fails allocating sensors to owners and non-owners when there are not enough sensors', () => {
      const participants = ['abc', 'rstarr', 'sam', 'pmaccartney', 'max', 'jlennon', 'xyz', 'asdf']
      const before = Workouts.findById('48582')
      return request(app)
        .post('/workout/48582/allocations')
        .send({ participants })
        .expect(400)
        .then(({ body }) => {
          expect(body.error.startsWith('Not enough sensors'))

          // Validate that the DB holds the same data
          const after = Workouts.findById('48582')
          expect(after.attrs).to.deep.equal(before.attrs)
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
