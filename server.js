require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log('MongoDB Connected'))
.catch(err => console.log(err));
 
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}));
app.get('/', (req, res) => {
  res.render('home');
});

// Routes
app.use('/', require('./routes/auth'));
app.use('/users', require('./routes/users'));
app.use('/reports', require('./routes/reports'));


app.listen(process.env.PORT, () => console.log(`Server running on ${process.env.PORT}`));
