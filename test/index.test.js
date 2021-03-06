const app = require('../index');
const request = require('supertest');
const chai = require('chai');

const expect = chai.expect;

describe('Test API open-shelf', () => {
  it('should be status = OK', (done) => {
    request(app)
        .post('/open-shelf')
        .send({
          barang: 'hehe',
          email: 'test@example.com',
        })
        .set('Accept', 'application/json')
        .end(function(err, res) {
          expect(res.status).to.equal(400);
          expect(res.body.status).to.equal('OK');
          done();
        });
  });
});

