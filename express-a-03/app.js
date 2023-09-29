const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

const rootRoutes = require('./routes/index');
const usersRoutes = require('./routes/users');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/users', usersRoutes);
app.use(rootRoutes);

app.listen(3000);