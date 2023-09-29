const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Post = require('../models/post');

const { clearImage } = require('../utils/file');

module.exports = {
  login: async function({email, password}, req) {
    const user = await User.findOne({ email: email });

    if (!user) {
      const error = new Error('A user with this email could not be found.');
      error.statusCode = 401;
      throw error;
    }

    const isEqual = await bcrypt.compare(password, user.password);

    if (!isEqual) {
      const error = new Error('Wrong password!');
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString()
      },
      'somesupersecretsecret',
      { expiresIn: '1h' }
    );

    return {
      token: token,
      userId: user._id.toString(),
    };
  },
  createUser: async function({ userInput }, req) {
    const email = userInput.email;
    const name = userInput.name;
    const password = userInput.password;

    const errors = [];
    if (!validator.isEmail(email)) {
      errors.push({ message: 'E-Mail is invalid.' });
    }
    if (
      validator.isEmpty(password) ||
      !validator.isLength(password, { min: 5 })
    ) {
      errors.push({ message: 'Password too short!' });
    }
    if (errors.length > 0) {
      const error = new Error('Invalid input.');
      error.data = errors;
      error.statusCode = 422;
      throw error;
    }

    const user = await User.findOne({ email: email });

    if (user) {
      const error = new Error('User exists already!');
      throw error;
    }

    try {
      const hashedPw = await bcrypt.hash(password, 12);
  
      const user = new User({
        email: email,
        password: hashedPw,
        name: name
      });

      const result = await user.save();

      return {
        ...result._doc,
        _id: result._id.toString(),
      };
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }

      throw err;
    }
  },
  createPost: async function({ postInput }, req) {
    if (!req.isAuth) {
      const error = new Error('Invalid input.');
      error.statusCode = 401;
      throw error;
    }

    const title = postInput.title;
    const content = postInput.content;
    const imageUrl = postInput.imageUrl;

    const errors = [];
    if (
      validator.isEmpty(title) ||
      !validator.isLength(title, { min: 5 })
    ) {
      errors.push({ message: 'Title is invalid.' });
    }
    if (
      validator.isEmpty(content) ||
      !validator.isLength(content, { min: 5 })
    ) {
      errors.push({ message: 'Content is invalid!' });
    }
    if (errors.length > 0) {
      const error = new Error('Invalid input.');
      error.data = errors;
      error.statusCode = 422;
      throw error;
    }

    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error('A user with this email could not be found.');
      error.statusCode = 401;
      throw error;
    }

    const post = await new Post({
      title: title,
      content: content,
      imageUrl: imageUrl,
      creator: user,
    }).save();

    console.log('post', post)

    user.posts.push(post);
    await user.save();

    return {
      ...post._doc,
      _id: post._id.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  },
  posts: async function({ page }, req) {
    if (!req.isAuth) {
      const error = new Error('Invalid input.');
      error.statusCode = 401;
      throw error;
    }

    const currentPage = page || 1;
    const perPage = 2;

    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .populate('creator')
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    return {
      posts: posts.map(post => {
        return {
          ...post._doc,
          _id: post._id.toString(),
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString(),
        };
      }),
      totalPosts: totalItems,
    };
  },
  post: async function({ postId }, req) {
    if (!req.isAuth) {
      const error = new Error('Invalid input.');
      error.statusCode = 401;
      throw error;
    }

    const post = await Post.findById(postId).populate('creator');

    if (!post) {
      const error = new Error('Could not find post.');
      error.statusCode = 404;
      throw error;
    }

    return {
      ...post._doc,
      _id: post._id.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  },
  updatePost: async function({ postId, postInput }, req) {
    if (!req.isAuth) {
      const error = new Error('Invalid input.');
      error.statusCode = 401;
      throw error;
    }

    const title = postInput.title;
    const content = postInput.content;
    const imageUrl = postInput.imageUrl;
    const errors = [];

    if (
      validator.isEmpty(title) ||
      !validator.isLength(title, { min: 5 })
    ) {
      errors.push({ message: 'Title is invalid.' });
    }
    if (
      validator.isEmpty(content) ||
      !validator.isLength(content, { min: 5 })
    ) {
      errors.push({ message: 'Content is invalid!' });
    }
    if (errors.length > 0) {
      const error = new Error('Invalid input.');
      error.data = errors;
      error.statusCode = 422;
      throw error;
    }

    const post = await Post.findById(postId).populate('creator');

    if (!post) {
      const error = new Error('Could not find post.');
      error.statusCode = 404;
      throw error;
    }

    if (post.creator._id.toString() !== req.userId.toString()) {
      const error = new Error('Not authorized!');
      error.statusCode = 403;
      throw error;
    }

    post.title = title;
    post.imageUrl = imageUrl ?? post.imageUrl;
    post.content = content;
    const result = await post.save();

    return {
      ...result._doc,
      _id: result._id.toString(),
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    };
  },
  deletePost: async function({ postId }, req) {
    if (!req.isAuth) {
      const error = new Error('Invalid input.');
      error.statusCode = 401;
      throw error;
    }
    
    const post = await Post.findById(postId);

    if (!post) {
      const error = new Error('Could not find post.');
      error.statusCode = 404;
      throw error;
    }

    if (post.creator.toString() !== req.userId.toString()) {
      const error = new Error('Not authorized!');
      error.statusCode = 403;
      throw error;
    }

    clearImage(post.imageUrl);
    await Post.findByIdAndRemove(postId);

    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    await user.save();

    return !!post;
  },
  user: async function(args, req) {
    if (!req.isAuth) {
      const error = new Error('Invalid input.');
      error.statusCode = 401;
      throw error;
    }
    
    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    return {
      ...user._doc,
      _id: user._id.toString(),
    };
  },
  updateStatus: async function({ status }, req) {
    if (!req.isAuth) {
      const error = new Error('Invalid input.');
      error.statusCode = 401;
      throw error;
    }

    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    user.status = status;
    await user.save();

    return !!user;
  },
};
