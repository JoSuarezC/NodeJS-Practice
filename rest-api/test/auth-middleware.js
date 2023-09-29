const { it, describe } = require('mocha');
const expect = require('chai').expect;
const jwt = require('jsonwebtoken');
const sinon = require('sinon');

const authMiddleware = require('../middleware/auth');

describe('Auth middleware', function() {
  it('should throw an error if no authorization header is present', function() {
    const req = {
      get: function(header) {
        return null;
      },
    };
  
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw('Error: Not Authenticated.');
  });
  
  it('should throw an error if the authorization header is only one string', function() {
    const req = {
      get: function(header) {
        return 'TestHeader';
      },
    };
  
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
  });

  it('should throw an error if the token cannot be verified', function() {
    const req = {
      get: function(header) {
        return 'Bearer TestHeader';
      },
    };
  
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
  });

  it('should yield userId after decoding the token', function() {
    const req = {
      get: function(header) {
        return 'Bearer TestHeader';
      },
    };

    sinon.stub(jwt, 'verify');
    jwt.verify.returns({
      email: 'test@test.com',
      userId: 'UserTestID',
    });
  
    authMiddleware(req, {}, () => {});
    expect(req).to.have.property('userId');
    expect(req).to.have.property('userId', 'UserTestID');
    expect(jwt.verify.called).to.be.true;
    jwt.verify.restore();
  });
});