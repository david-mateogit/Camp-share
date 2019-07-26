/* eslint-disable no-undef */
const Campground = require('../models/campground');
const Comment = require('../models/comment');

//all the middleware goes here
const middlewareObj = {
  checkCampgroundOwnership: function(req, res, next) {
    Campground.findById(req.params.id, function(err, foundCampground) {
      if (err || !foundCampground) {
        console.log(err);
        req.flash('error', 'Sorry, that campground does not exist!');
        res.redirect('/campgrounds');
      } else if (
        foundCampground.author.id.equals(req.user._id) ||
        req.user.isAdmin
      ) {
        req.campground = foundCampground;
        next();
      } else {
        req.flash('error', "You don't have permission to do that!");
        res.redirect('/campgrounds/' + req.params.id);
      }
    });
  },
  checkCommentOwnership: function(req, res, next) {
    Comment.findById(req.params.comment_id, function(err, foundComment) {
      if (err || !foundComment) {
        console.log(err);
        req.flash('error', 'Sorry, that comment does not exist!');
        res.redirect('/campgrounds');
      } else if (
        foundComment.author.id.equals(req.user._id) ||
        req.user.isAdmin
      ) {
        req.comment = foundComment;
        next();
      } else {
        req.flash('error', "You don't have permission to do that!");
        res.redirect('/campgrounds/' + req.params.id);
      }
    });
  },
  isLoggedIn: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    //display flash message before redirect
    req.flash('error', 'You need to be logged in to do that!');
    res.redirect('/login');
  }
};

module.exports = middlewareObj;
