/* eslint-disable no-console */
/* eslint-disable no-undef */
const express = require('express');
const router = express.Router({ mergeParams: true });
const Campground = require('../models/campground');
const Comment = require('../models/comment');
const middleware = require('../middleware');

//Comments new
router.get('/new', middleware.isLoggedIn, function(req, res) {
  //find campground by id
  Campground.findById(req.params.id, function(error, campground) {
    if (error) {
      console.log(error);
    } else {
      res.render('comments/new', { campground: campground });
    }
  });
});

//Comments save
router.post('/', middleware.isLoggedIn, function(req, res) {
  //lookup campground using ID
  Campground.findById(req.params.id, function(err, campground) {
    if (err) {
      console.log(err);
      res.redirect('/campgrounds');
    } else {
      //create a new comment
      Comment.create(req.body.comment, function(err, comment) {
        if (err) {
          req.flash('error', 'Something went wrong!');
          console.log(err);
        } else {
          //add username and id to comment
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          //save comment
          comment.save();
          //connect new comment to campground
          campground.comments.push(comment);
          campground.save();
          //redirect campground show page
          req.flash('success', 'Successfully added comment!');
          res.redirect('/campgrounds/' + campground._id);
        }
      });
    }
  });
});

//Edit comment route
router.get(
  '/:comment_id/edit',
  middleware.isLoggedIn,
  middleware.checkCommentOwnership,
  function(req, res) {
    res.render('comments/edit', {
      campground_id: req.params.id,
      comment: req.comment
    });
  }
);

//Update comment route
router.put('/:comment_id', middleware.checkCommentOwnership, function(
  req,
  res
) {
  //find and update the correct campground
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(
    err,
    updatedComment
  ) {
    if (err) {
      res.redirect('back');
    } else {
      res.redirect('/campgrounds/' + req.params.id);
    }
  });
});

//Comment destroy route
router.delete('/:comment_id', middleware.checkCommentOwnership, function(
  req,
  res
) {
  //findByIdAndRemove
  Comment.findByIdAndRemove(req.params.comment_id, function(err) {
    if (err) {
      res.redirect('back');
    } else {
      req.flash('success', 'Comment deleted!');
      res.redirect('/campgrounds/' + req.params.id);
    }
  });
});

module.exports = router;
