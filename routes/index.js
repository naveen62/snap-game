var express = require('express');
var router = express.Router();
var Product = require("../models/product");
var Cart = require("../models/cart")
var Order = require("../models/order")

/* GET home page. */
router.get('/', function(req, res, next) {
    var successMsg = req.flash('success')[0]
    Product.find({}, function(err, products) {
        if(err) {
            console.log(err);
        } else {
            var productChunks = [];
            var chunkSize = 3
            for(var i=0; i<products.length; i += chunkSize) {
                productChunks.push(products.slice(i, i+ chunkSize))
            }
              res.render('shop/index', { title: 'shopping-cart', products: productChunks, successMsg: successMsg, noMessages: !successMsg  });
        }
    }) 
});
router.get('/add-to-cart/:id', function(req, res) {
    var product = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart: {})
    
    Product.findById(req.params.id, function(err, product) {
        if(err) {
            return res.redirect('/')
        } 
        cart.add(product, product.id)
        req.session.cart = cart;
        res.redirect('/')
    })
})
router.get('/shopping-cart', function(req, res) {
    if(! req.session.cart) {
        return res.render('shop/shopping-cart', {products: null})
    }
    var cart = new Cart(req.session.cart);
    res.render('shop/shopping-cart', {products: cart.generateArray(), totalPrice: cart.totalPrice})
})
router.get('/checkout',isLoggedIn, function(req, res) {
    if(!req.session.cart) {
        return res.redirect('/shopping-cart')
    }
    var cart = new Cart(req.session.cart);
    var errMsg = req.flash('error')[0]
    res.render('shop/checkout', {total: cart.totalPrice, errMsg: errMsg, noErrors: !errMsg})
})
router.post('/checkout',isLoggedIn, function(req, res) {
    if(!req.session.cart) {
        return res.redirect('/shopping-cart')
    }
    var cart = new Cart(req.session.cart);
    
    var stripe = require("stripe")(
  "sk_test_A85mRraDp1rSJUZOwy86bJeH"
);

stripe.charges.create({
  amount: cart.totalPrice * 100,
  currency: "usd",
  source: req.body.stripeToken, // obtained with Stripe.js
  description: "Charge for elijah.jackson@example.com"
}, function(err, charge) {
  if(err) {
      console.log(err.message)
      req.flash('error', err.message)
      return res.redirect('/checkout')
  }
  var order = new Order({
      user: req.user,
      cart: cart,
      address: req.body.address,
      name: req.body.name,
      paymentId: charge.id
  })
  order.save(function(err, result) {
      req.flash('success', "Successfully brought product");
      req.session.cart = null;
      res.redirect('/');
  })
 
 });
})
router.get('/nyg201yy/clearcart', function(req, res) {
    req.session.cart = null;
    res.redirect('/shopping-cart')
})
router.get('/nyg201yy/addgame', function(req, res) {
    res.render('shop/add')
})
router.post('/nyg201yy/addgame', function(req, res) {
    var newGame = {
        imgpath: req.body.image,
        title: req.body.title,
        desc: req.body.desc,
        price: req.body.price
    }
    Product.create(newGame, function(err, result) {
        if(err) {
            console.log(err)
            res.redirect('/nyg201yy/addgame')
        } else {
            res.redirect('/')
        }
    })
})

module.exports = router;

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash('checking', "You need to sign in or sign up to proceed")
    req.session.oldUrl = req.url;
    res.redirect('/user/signin');
}