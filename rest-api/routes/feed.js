const express = require('express');
const { body } = require('express-validator');
const feedControlller = require('../controllers/feed');
const isAuth = require('../middleware/auth');
const router = express.Router();

router.get('/posts', isAuth, feedControlller.getPosts);

router.get('/post/:postId', isAuth, feedControlller.getPost);

router.post(
  '/post',
  isAuth,
  [
    body('title')
      .trim()
      .isLength({ min: 5 }),
    body('content')
      .trim()
      .isLength({ min: 5 }),
  ],
  feedControlller.createPost
);

router.put(
  '/post/:postId',
  isAuth,
  [
    body('title')
      .trim()
      .isLength({ min: 5 }),
    body('content')
      .trim()
      .isLength({ min: 5 }),
  ],
  feedControlller.updatePost
);

router.delete(
  '/post/:postId',
  isAuth,
  feedControlller.deletePost
);


module.exports = router;
