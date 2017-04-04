var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var image = new Schema({
    data: {type: Buffer, required: true},
    type: {type: String, required: true}
});

module.exports = mongoose.model('Image', image);