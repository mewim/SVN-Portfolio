/*
 * API for vote
 */
const express = require('express'),
    router = express.Router();
const Comment = require('../models/comment'),
    VoteCount = require('../models/vote_count');

/**
 * Increment count for (comment_id, ip) in VoteCount Schema
 * @param {String} comment_id
 * @param {String} ip
 * @param {Function} callback - will be called after count is incremented
 */
const inc_vote_count = function (comment_id, ip, callback) {
    VoteCount.findOneAndUpdate(
        {
            comment_id: comment_id,
            ip: ip
        },
        {
            $inc: {'count': 1}
        },
        {
            'new': true,
            'upsert': true
        },
        function (err, vote_count) {
            if (err) {
                callback(-1);
            }
            else {
                callback(vote_count.count);
            }
        }
    );
};

/**
 * Update votes for a give comment
 * @param {String} comment_id
 * @param {String} ip
 * @param {Number} inc
 * @param {Function} callback - will be called after vote is incremented
 */
const change_vote = function (comment_id, ip, inc, callback) {
    var option = inc ? {$inc: {'votes': 1}} : {$inc: {'votes': -1}};
    inc_vote_count(comment_id, ip, function (vote_count) {
        if (vote_count === -1) {
            callback({'success': false, 'message': 'You are voting for a non-exist comment. 😂'});
        }
        else if (vote_count > 20) {
            callback({'success': false, 'message': 'You are spam clicking. 😂'})
        }
        else {
            Comment.findByIdAndUpdate(comment_id, option, {'new': true}, function (err, comment) {
                if (err) {
                    callback({'success': false, 'message': 'There is a database error. 😂'});
                }
                else {
                    callback({'success': true});
                }
            });
        }
    });
};

// GET upvote
router.get('/u/:comment_id', function (req, res) {
    change_vote(req.params.comment_id, req.ip, true, function (res_message) {
        res.send(res_message);
    });
});

// GET downvote
router.get('/d/:comment_id', function (req, res) {
    change_vote(req.params.comment_id, req.ip, false, function (res_message) {
        res.send(res_message);
    });
});

module.exports = router;