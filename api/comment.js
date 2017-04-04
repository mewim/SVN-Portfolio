/*
 * API for comment
 */
const Comment = require('../models/comment');
const RedFlag = require('../models/red_flag');
const express = require('express'),
    router = express.Router();

/**
 * Filtering comment
 * @param {String} comment
 * @param {Function} callback - will be called after comment is filtered
 */
const filter_comment = function (comment, callback) {
    if (!comment) {
        return callback('No comment.', null);
    }
    RedFlag.find({}, function (err, red_flags) {
        if (err) {
            return callback(error, null);
        }
        else {
            for (var i = 0; i < red_flags.length; ++i) {
                comment = comment.split(red_flags[i].original).join(red_flags[i].replaced);
            }
            callback(null, comment);
        }
    });
};

// Handle POST
router.post('/', function (req, res) {
    var body = req.body;
    filter_comment(body.content, function (filter_err, filtered) {
        if (filter_err) {
            return res.status(500).send({error: filter_err});
        }
        console.log(filtered);
        body.content = filtered;
        Comment.create(body, function (err, comment) {
            if (err) {
                return res.status(500).send({error: err});
            }
            else {
                res.status(200).send(comment);
            }
        });
    });
});

// POST to retrive all comments for a given path
router.post('/p', function (req, res) {
    console.log(req.body);
    var path = (req.body) ? req.body.path : null;
    if (!path) {
        return res.status(400).send({
            error: 'No path specified.'
        });
    }
    Comment.find({path: path}, function (err, comments) {
        if (err) {
            // Handle database error
            return res.status(500).send({
                error: err
            });
        }
        // Send comment
        res.status(200).send(comments);
    });
});

// GET a comment using ID
router.get('/:comment_id', function (req, res) {
    Comment.findOne({_id: req.params.comment_id}, function (err, comment) {
        if (err) {
            // Handle database error
            return res.status(500).send({
                error: err
            });
        }

        if (!comment) {
            // Send 404 when image not found.
            return res.status(404).send({error: 'No comment found.'});
        }
        // Send comment
        res.status(200).send(comment);
    });
});


module.exports = router;