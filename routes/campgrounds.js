/* eslint-disable no-console */
/* eslint-disable no-undef */
const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const Comment = require('../models/comment');
const middleware = require('../middleware');

//INDEX - show all campgrounds
router.get('/', function(req, res) {
  var perPage = 8;
  var pageQuery = parseInt(req.query.page);
  var pageNumber = pageQuery ? pageQuery : 1;
  var noMatch = null;
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    Campground.find({ name: regex })
      .skip(perPage * pageNumber - perPage)
      .limit(perPage)
      .exec(function(err, allCampgrounds) {
        Campground.count({ name: regex }).exec(function(err, count) {
          if (err) {
            console.log(err);
            res.redirect('back');
          } else {
            if (allCampgrounds.length < 1) {
              noMatch = 'No campgrounds match that query, please try again.';
            }
            res.render('campgrounds/index', {
              campgrounds: allCampgrounds,
              current: pageNumber,
              pages: Math.ceil(count / perPage),
              noMatch: noMatch,
              search: req.query.search
            });
          }
        });
      });
  } else {
    // get all campgrounds from DB
    Campground.find({})
      .skip(perPage * pageNumber - perPage)
      .limit(perPage)
      .exec(function(err, allCampgrounds) {
        Campground.count().exec(function(err, count) {
          if (err) {
            console.log(err);
          } else {
            res.render('campgrounds/index', {
              campgrounds: allCampgrounds,
              current: pageNumber,
              pages: Math.ceil(count / perPage),
              noMatch: noMatch,
              search: false
            });
          }
        });
      });
  }
});

//NEW ROUTE - Show form to create new campground
router.get('/new', middleware.isLoggedIn, function(req, res) {
  res.render('campgrounds/new');
});

//CREATE ROUTE - Add new camps to database
router.post('/', function(req, res) {
  //get data from form and add to campgrounds array
  const name = req.body.name;
  const price = req.body.price;
  const image = req.body.image;
  const description = req.body.description;
  const author = {
    id: req.user._id,
    username: req.user.username
  };
  const newCampground = {
    name,
    price,
    image,
    description,
    author
  };
  //Create a new campground and save to DB
  Campground.create(newCampground, function(err, newlyCreated) {
    if (err) {
      console.log(err);
    } else {
      console.log(newlyCreated);
      //redirect back to campgrounds page
      res.redirect('/campgrounds');
    }
  });
});

//SHOW ID ROUTE - Show campground detail info
router.get('/:id', function(req, res) {
  //Find the campground with provided ID
  Campground.findById(req.params.id)
    .populate('comments')
    .exec(function(err, foundCampground) {
      if (err || !foundCampground) {
        console.log(err);
        req.flash('error', 'Sorry, that campground does not exist!');
        return res.redirect('/campgrounds');
      }
      console.log(foundCampground);
      //render show template with that campground
      res.render('campgrounds/show', { campground: foundCampground });
    });
});

//Edit campground route
router.get(
  '/:id/edit',
  middleware.isLoggedIn,
  middleware.checkCampgroundOwnership,
  function(req, res) {
    res.render('campgrounds/edit', { campground: req.campground });
  }
);

//Update campground route
router.put('/:id', middleware.checkCampgroundOwnership, function(req, res) {
  //find and update the correct campground
  Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(
    err,
    updatedCampground
  ) {
    if (err) {
      req.flash('error', err.message);
      res.redirect('/campgrounds');
    } else {
      req.flash('success', 'Successfully Updated!');
      res.redirect('/campgrounds/' + req.params.id);
    }
  });
});

//Campground destroy route
router.delete('/:id', middleware.checkCampgroundOwnership, function(req, res) {
  Campground.findByIdAndRemove(req.params.id, function(err, campgroundRemoved) {
    if (err) {
      console.log(err);
    }
    Comment.deleteMany({ _id: { $in: campgroundRemoved.comments } }, function(
      err,
      comments
    ) {
      req.flash('error', campgroundRemoved.name + ' deleted!');
      res.redirect('/campgrounds');
    });
  });
});

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

module.exports = router;
