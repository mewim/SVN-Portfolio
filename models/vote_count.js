var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var vote_count = new Schema({
    ip: {type: String, required: true},
    comment_id: {type: mongoose.Schema.Types.ObjectId, ref:'Comment', required: true},
    count: {type:Number, default: 0, required: true}
});

module.exports = mongoose.model('VoteCount', vote_count);