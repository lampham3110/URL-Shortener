var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var MongoClient = require('mongoose');
var base58 = require('./base58');

// grab the url model
var Url = require('./models/url');

MongoClient.connect('mongodb://localhost/url_shortener', {
  useNewUrlParser: true
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

//Route for front-end homepage//
app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'index.html'));
});

//Route for returning a shorten URL//
app.post('/api/shorten', function(req, res){
  var longUrl = req.body.url;
  var shortUrl = '';

  // check if url already exists in database
  Url.findOne({long_url: longUrl}, function (err, doc){
    if (doc){
      shortUrl = 'http://localhost:8000/' + base58.encode(doc._id);

      //If document exists, so we return it without creating a new entry
      res.send({'shortUrl': shortUrl});
    } else {
      // If it doesn't exist, go ahead and create it//
      var newUrl = Url({
        long_url: longUrl
      });

      // save the new link
      newUrl.save(function(err) {
        if (err){
          console.log(err);
        }

        shortUrl = 'http://localhost:8000/' + base58.encode(newUrl._id);

        res.send({'shortUrl': shortUrl});
      });
    }

  });

});

//Route for redirecting original URL given shorten URL//
app.get('/:encoded_id', function(req, res){

  var base58Id = req.params.encoded_id;

  var id = base58.decode(base58Id);

  // Check if URL already in database
  Url.findOne({_id: id}, function (err, doc){
    if (doc) {
      res.redirect(doc.long_url);
    } else {
      res.redirect('http://localhost:8000/');
    }
  });

});

var server = app.listen(8000, function(){
  console.log('Server listening on port 8000');
});
