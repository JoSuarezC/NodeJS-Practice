const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const { graphqlHTTP } = require('express-graphql');

const { clearImage } = require('./utils/file');

const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');
const auth = require('./middleware/is-auth');

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

app.use(auth);

app.put('/post-image', (req, res, next) => {
  if (!req.isAuth) {
    throw new Error('Not Authenticated');
  }

  if (!req.file) {
    return res.status(200).json({
      message: 'No file provided',
    });
  }

  if (req.body.oldPath) {
    clearImage(req.body.oldPath);
  }

  return res.status(201).json({
    message: 'File stored',
    filePath: req.file.path,
  });
});

app.use('/graphql', graphqlHTTP({
  schema: graphqlSchema,
  rootValue: graphqlResolver,
  graphiql: true,
  formatError(error) {
    if (!error.originalError) {
      return error;
    }

    const data = error.originalError.data;
    const msg = error.message || 'Error: Something went wrong.'; 
    const code = error.originalError.statusCode || 500;

    return {
      message: msg,
      status: code,
      data: data,
    };
  }
}));

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

const MONGODB_URI = process.env.DB_URI + 'messageNode';

mongoose
  .connect(
    MONGODB_URI,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  )
  .then(result => {
    app.listen(8080);
  })
  .catch(err => console.log(err));
