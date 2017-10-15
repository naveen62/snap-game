var express = require('express');
var router = express.Router();
var Product = require("../models/product");
var csurf = require("csurf");
var passport = require("passport");
var Order = require("../models/order")
var Cart = require("../models/cart");
var User = require("../models/user")
var mongoose = require("mongoose")
var nodemailer = require("nodemailer");
var asyncc = require("async");
var crypto = require("crypto");

var csurfProtecion = csurf();
router.use(csurfProtecion);

router.get('/profile',isLoggedIn, function(req, res) {
    Order.find({user: req.user}, function(err, orders) {
        if(err) {
          return  res.send('Error');
        } 
        var cart;
        orders.forEach(function(order) {
            cart = new Cart(order.cart);
            order.items = cart.generateArray();
        })
        res.render('user/profile', {orders: orders})
    })
})
router.get('/logout',isLoggedIn, function(req, res) {
    req.logout()
    res.redirect('/')
})
router.use('/', notLoggedIn, function(req, res, next) {
    next();
})
router.get('/signup', function(req, res) {
    var messages = req.flash('error');
    res.render('user/signUp', {csrfToken: req.csrfToken(), messages: messages, haserror: messages.length > 0})
})
router.post('/signup', passport.authenticate('local.signup', {
    failureRedirect: '/user/signup',
    failureFlash: true
}), function(req, res, next) {
    if(req.session.oldUrl) {
        var oldUrl = req.session.oldUrl
        req.session.oldUrl = null;
        res.redirect(oldUrl)
    } else {
        res.redirect('/user/profile')
    }
})

router.get('/signin', function(req, res) {
    var messages = req.flash('error');
    var check = req.flash('checking');
    var onCheck = check.length > 0
    res.render('user/signIn', {csrfToken: req.csrfToken(), messages: messages, haserror: messages.length > 0, check: check, onCheck: check[0]})
})
router.post('/signin', passport.authenticate('local.signin', {
    failureRedirect: '/user/signin',
    failureFlash: true
}), function(req, res, next) {
    if(req.session.oldUrl) {
        var oldUrl = req.session.oldUrl
        req.session.oldUrl = null;
        res.redirect(oldUrl)
    } else {
        res.redirect('/user/profile')
    }
})
// forget passwaord
router.get('/forgot',notLoggedIn, function(req, res) {
    var reset = req.flash('reset')
    res.render('user/forgot', {reset: reset, resetCh: reset[0], csrfToken: req.csrfToken()})
})

router.post('/forgot', function(req, res, next) {
    asyncc.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token)
            })
        },
        function(token, done) {
            User.findOne({email: req.body.email}, function(err, user) {
                if(!user) {
                    req.flash('reset', "no account with that email address exists");
                    return res.redirect('/user/forgot');
                }
                user.resetPasswordToken =token;
                user.resetPasswordExpires = Date.now() + 3600000
                
                user.save(function(err) {
                    done(err, token, user)
                })
            })
        },
        function(token, user, done) {
            var transporter = nodemailer.createTransport({
                service : "Gmail",
                auth: {
                    user: 'navattesting@gmail.com',
                    pass: 'nyg201yy'
                }
            })
            var mailOptions = {
                to: user.email,
                form: 'navattesting@gmail.com',
                subject: 'Password reset',
                text: 'To reset your passwaord click link below',
                html: "<h3>Click <a href='" + "http://" + req.headers.host + "/user/reset/" + token + "'>here</a></h3>"
                
            };
            transporter.sendMail(mailOptions, function(err) {
                console.log('mail sent')
                req.flash('reset', 'A mail sent to ' + user.email)
                done(err, 'done')
            })
        }
        ], function(err) {
            if(err) return next(err);
            res.redirect('/user/forgot')
        })
})
router.get('/reset/:token', function(req, res) {
    var Match = req.flash('update');
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, function(err, user) {
        if(!user) {
            req.flash('reset', 'Password reset toke is invalid or has expired');
            return res.redirect('/user/forgot');
        }
        return res.render('user/reset', {token: req.params.token, csrfToken: req.csrfToken(), Match: Match, MatchCh: Match[0]})
    })
})
router.post('/reset/:token', function(req, res) {
    asyncc.waterfall([
        function(done) {
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}},function(err, user) {
        if(!user) {
            req.flash('reset', 'Password reset token is invalid or has expired')
            return res.redirect('/user/forgot')
      }
      if(req.body.newPass == req.body.confirm) {
          user.password = user.encryptPassword(req.body.newPass)
          user.resetPasswordExpires = undefined
          user.resetPasswordToken = undefined
          user.save(function(err) {
              req.logIn(user, function(err) {
                  done(err, user)
              }) 
          })
      } else {
          req.flash('update', 'Password did not match');
          return res.redirect('back')
      }
    });
   },
   function(done) {
        req.flash('success', 'Password changed Successfully')
        res.redirect('/')
    }
    ])
})

module.exports = router

// middleware
function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}
function notLoggedIn(req, res, next) {
    if(!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}
