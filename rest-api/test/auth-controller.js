const expect = require('chai').expect;
const sinon = require('sinon');
const mongoose = require('mongoose');

const User = require('../models/user');
const AuthController = require('../controllers/auth');

describe('Auth Controller - Login', function() {
  let user;

  before(function(done) {
    const MONGODB_URI = process.env.DB_URI + 'test-messages';

    mongoose
      .connect(MONGODB_URI)
      .then(() => {
        return new User({
          email: 'test@test.com',
          password: 'tester',
          name: 'Test',
          posts: [],
        }).save();
      })
      .then((result) => {
        user = result;
        done();
      });
  });

  it('should throw an error with code 500 if accessing the database fails', function(done) {
    sinon.stub(User, 'findOne');
    User.findOne.rejects();

    const req = {
      body: {
        email: 'test@test.com',
        password: 'tester'
      }
    };

    AuthController
      .login(req, {}, (err) => {})
      .then(result => {
        expect(result).to.be.an('error');
        expect(result).to.have.property('statusCode', 500);
        done();
      });

    User.findOne.restore();
  });

  // Arrow func to get user variable
  it('should send a response with a valid user status for an existing user', (done) => {
    const res = {
      statusCode: 500,
      userStatus: null,
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.userStatus = data.status;
      },
    };
    const req = {
      userId: user._id,
    };

    AuthController.getUserStatus(req, res, () => {})
      .then(() => {
        expect(res.statusCode).to.be.equal(200);
        expect(res.userStatus).to.be.equal('New');
        done();
      })
      .catch(err => console.log(err));
  });

  after(function(done) {
    User.deleteMany({})
      .then(() => {
        return mongoose.disconnect();
      })
      .then(() => {
        done();
      });
  });
});
