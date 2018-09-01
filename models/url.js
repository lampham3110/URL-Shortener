var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Create a counter collection for incrementing _id through seq//
var CounterSchema = Schema({
    _id: {type: String, required: true},
    seq: { type: Number, default: 0 }
});

var counter = mongoose.model('counter', CounterSchema);


// Create a schema collection for _id with new URL//
var urlSchema = new Schema({
  _id: {type: Number, index: true},
  long_url: String,
  created_date: Date
});

urlSchema.pre('save', function(next){
  var doc = this;
  counter.findByIdAndUpdate({_id: 'url_count'}, {$inc: {seq: 1} }, function(error, counter) {
      if (error)
          return next(error);
      doc.created_date = new Date();
      doc._id = counter.seq;
      next();
  });
});

var Url = mongoose.model('Url', urlSchema);

module.exports = Url;
