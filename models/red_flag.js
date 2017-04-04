var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var red_flag = new Schema({
    original: {type: String, required: true, unique: true},
    replaced: {type: String, required: true}
});

module.exports = mongoose.model('RedFlag', red_flag);