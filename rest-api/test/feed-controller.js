const expect = require('chai').expect;
const mongoose = require('mongoose');

const User = require('../models/user');
const FeedController = require('../controllers/feed');

describe('Feed Controller - Create Post', function() {
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

  it('should add a created post to the posts of the creator', (done) => {
    const req = {
      body: {
        title: 'Test',
        content: 'Test Content',
      },
      file: {
        path: 'ImagePath',
      },
      userId: user._id,
    };
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

    FeedController
      .createPost(req, res, (err) => {})
      .then(user => {
        expect(user).to.have.property('posts');
        expect(user.posts).to.have.length(1);
        done();
      });
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
