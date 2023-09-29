const path = require('path');
const fs = require('fs');
const https = require('https');

const express = require('express');
const bodyParser = require('body-parser');
const multerParser = require('multer');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const errorController = require('./controllers/error');
const User = require('./models/user');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const app = express();

// If set to production express will use a prod version
console.log(process.env.NODE_ENV);

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.fbxmmhb.mongodb.net/${process.env.MONGO_DB}`;

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
});

const csrfProtection = csrf();

const privateKey = fs.readFileSync('server.key');
const certificate = fs.readFileSync('service.cert'); // should be server lol

app.set('view engine', 'ejs');
app.set('views', 'views');

// Add Secure HTTP Headers
app.use(helmet());

// Compress data (assets (JS/CSS/Files) except images) that goes to client
app.use(compression());

// Logging data to files
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' } // Append to the end of the file
);

app.use(morgan('combined', { stream: accessLogStream }));

// Does not work for binary data as submitting files 
// x-www-form-urlenconded <form>
app.use(bodyParser.urlencoded({ extended: false }));

// Listening for multipart form-data that contains image field
const fileStorage = multerParser.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, `${new Date().toISOString()} - ${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const imagesMIMETypes = [
    'image/png',
    'image/jpg',
    'image/jpeg'
  ];

  cb(null, imagesMIMETypes.includes(file.mimetype));
};

app.use(multerParser({
  storage: fileStorage,
  fileFilter: fileFilter,
}).single('image'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(session({
  secret: 'my secret',
  resave: false,
  saveUninitialized: false,
  store: store,
}));
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  req.session.user
    ? User.findById(req.session.user._id)
      .then((user) => {
        if (user) {
          req.user = user;
        }

        next();
      })
      .catch((err) => {
        next(new Error(err));
      })
    : next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);
app.use(errorController.get500);

mongoose.connect(MONGODB_URI)
  .then(() => {
    https
      .createServer(
        {
          key: privateKey,
          cert: certificate,
        },
        app
      )
      .listen(process.env.PORT || 3000);
  })
  .catch((err) => {
    console.log(err);
  });