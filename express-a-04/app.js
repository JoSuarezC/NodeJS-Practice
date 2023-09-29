const express = require('express');
const path = require('path');

const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', 'views');

const usersList = [];

app.get('/users',(req, res, next) => {
  res.render('users', {
    pageTitle: 'Users',
    users: usersList,
  });
});

app.post('/users', (req, res, next) => {
  usersList.push({ name: req.body.name });
  res.redirect('/users');
});

app.get('/',(req, res, next) => {
  console.log('init', app.get('views'))
  res.render('test', {
    pageTitle: 'Add User',
  });
});

app.listen(3000);