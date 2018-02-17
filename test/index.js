const request = require('supertest')
const { expect } = require('chai')

const app = require('../src/app')

describe('Smoke test', () => {
  it('it works', () =>
    request(app)
      .get('/workouts')
      .expect(200)
      .then(response => {
        expect(response.body).to.have.property('result', 'ok')
      })
  )
})
