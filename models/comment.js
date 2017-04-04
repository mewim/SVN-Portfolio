var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var comment = new Schema({
    username: {type: String, default: 'Anonymous'},
    path: {type: String, required: true},
    parent: {type: mongoose.Schema.Types.ObjectId},
    level:{type: Number, default: 0},
    date: {type: Date, default: Date.now},
    content: {type: String, required: true},
    votes: {type: Number, default: 0},
    img_id: {type: mongoose.Schema.Types.ObjectId, ref:'Images'}
});

module.exports = mongoose.model('Comment', comment);