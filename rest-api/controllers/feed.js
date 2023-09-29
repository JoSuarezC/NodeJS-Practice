const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const io = require('../socket');
const Post = require('../models/post');
const User = require('../models/user');

const ITEMS_PER_PAGE = 2;

exports.getPosts = async (req, res, next) => {
  const page = req.query.page ?? 1;

  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .populate('creator')
      .sort({ createdAt: -1 })
      .skip((+page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
    
    return res.status(200).json({
      message: 'Fetched posts successfully',
      posts: posts,
      totalItems: totalItems,
    });
  } catch (error) {
    handleError(error, next);
  }
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;

  return Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error('Post not found.');
        error.statusCode = 404;
        throw error;
      }

      return res.status(200).json({
        message: 'Post fetched',
        post: post,
      });
    })
    .catch((err) => {
      handleError(err, next);
    });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }

  if (!req.file) {
    const error = new Error('No image provided');
    error.statusCode = 422;
    throw error;
  }

  const title = req.body.title;
  const imageUrl = req.file.path;
  const content = req.body.content;

  const post = new Post({
    title: title,
    imageUrl: imageUrl,
    content: content,
    creator: req.userId,
  });
  
  return post
    .save()
    .then((post) => {
      console.log('post', post);
      return User.findById(req.userId);
    })
    .then((user) => {
      user.posts.push(post);
      return user.save();
    })
    .then((savedUser) => {
      // Comment when running unit testing
      io.getSocket().emit('posts', {
        action: 'create',
        post: {
          ...post._doc,
          creator: {
            _id: req.userId,
            name: savedUser.name,
          },
        },
      });
      
      res.status(201).json({
        message: 'Post created successfully!',
        post: post,
        creator: {
          _id: savedUser._id,
          name: savedUser.name,
        },
      });
      console.log('savedUser', savedUser);
      return savedUser;
    })
    .catch((err) => {
      console.log('err',err);
      handleError(err, next);
    });
};

exports.updatePost = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }

  const postId = req.params.postId;
  const title = req.body.title;
  let imageUrl = req.body.image;
  const content = req.body.content;

  if (req.file) {
    imageUrl = req.file.path
  }

  if (!imageUrl) {
    const error = new Error('No image provided');
    error.statusCode = 422;
    throw error;
  }

  return Post.findById(postId)
    .populate('creator')
    .then((post) => {
      if (!post) {
        const error = new Error('Post not found.');
        error.statusCode = 404;
        throw error;
      }

      if (post.creator._id.toString() !== req.userId) {
        const error = new Error('Error: Not authorized');
        error.statusCode = 403;
        throw error;
      }

      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }

      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;

      return post.save();
    })
    .then((post) => {
      const socket = io.getSocket();
      socket.emit('posts', {
        action: 'update',
        post: post,
      });

      return res.status(200).json({
        message: 'Post updated',
        post: post,
      });
    })
    .catch((err) => {
      handleError(err, next);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;

  return Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error('Post not found.');
        error.statusCode = 404;
        throw error;
      }

      if (post.creator.toString() !== req.userId) {
        const error = new Error('Error: Not authorized');
        error.statusCode = 403;
        throw error;
      }
      
      clearImage(post.imageUrl)
      return Post.findByIdAndRemove(postId);
    })
    .then((post) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      user.posts.pull(postId);
      return user.save();
    })
    .then((result) => {
      const socket = io.getSocket();
      socket.emit('posts', {
        action: 'delete',
      });

      return res.status(200).json({
        message: 'Post deleted',
      });
    })
    .catch((err) => {
      handleError(err, next);
    });
};

const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err));
};
