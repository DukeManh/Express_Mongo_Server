var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/users');
const { route } = require('./dishRouter');
var passport = require('passport');


var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', function (req, res, next) {
  User.find({})
    .then((users) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(users);
    })
    .catch(err => next(err));
});


router.post('/signup', (req, res, next) => {
  User.register(new User({ username: req.body.username }), req.body.password, (err, user) => {
    if (err) {
      res.status = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({ err: err });
    }
    else {
      passport.authenticate('local')(req, res, () => {
        res.status = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({ success: true, status: 'Registration Successful' });
        console.log('lagging');
      });
    }
  });
});

router.post('/login', passport.authenticate('local'), (req, res) => {
  res.status = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({ status: 'You are logged in', success: true });
});



router.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('sesson-id');
    res.redirect('/');
  }
  else {
    var err = new Error('You are not logged in');
    next(err);
  }
});


module.exports = router;
