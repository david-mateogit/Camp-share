/* eslint-disable no-console */
/* eslint-disable no-undef */
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
methodOverride = require('method-override');
const User = require('./models/user');
//const seedDB = require('./seeds');

//Requiring routes
const commentRoutes = require('./routes/comments');
const campgroundRoutes = require('./routes/campgrounds');
const indexRoutes = require('./routes/index');

//Mongoose SETUP
//mongoose.connect('mongodb://localhost/yelp_camp', { useNewUrlParser: true });
mongoose.connect(
  'mongodb+srv://dataBaseApp:8VKGfMSzYQDyzjQ@cluster0-i3tyr.mongodb.net/yelp_camp?retryWrites=true&w=majority',
  { useNewUrlParser: true }
);
mongoose.set('useCreateIndex', true);

//Express use
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));
app.use(flash());

//seedDB(); //seed the database

//Passport Configuration
app.use(
  require('express-session')({
    secret: 'This is the Secret!',
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Pass user to all routes
app.use(function(req, res, next) {
  //Moment JS
  app.locals.moment = require('moment');
  res.locals.currentUser = req.user;
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  next();
});

//Import Routes
app.use('/campgrounds/:id/comments', commentRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use(indexRoutes);

//START EXPRESS SERVER
app.listen(process.env.PORT || 3000, function() {
  console.log('The YelpCamp Server has started!');
});
