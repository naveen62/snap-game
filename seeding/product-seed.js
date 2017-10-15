var Product = require("../models/product")
var mongoose = require("mongoose");

mongoose.connect('mongodb://localhost/shopping', {useMongoClient: true})
mongoose.Promise = global.Promise

var products = [
        new Product({
            imgpath: 'https://pisces.bbystatic.com/BestBuy_US/Gallery/flex_aa-gta-SOL-18186-0901.jpg',
            title: 'gta 5',
            desc: 'grand theft auto',
            price: 20
        }),
        
          
    ]
    var done = 0;
    for(var i=0; i<products.length; i++) {
      products[i].save(function(err, result) {
        if(err) {
          console.log(err);
        }
        done++
        if(done === products.length) {
          exit();
        }
      });
    }
    function exit() {
      mongoose.disconnect();
    }