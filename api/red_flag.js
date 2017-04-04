/*
 * API for red flag word
 */

const RedFlag = require('../models/red_flag');
const express = require('express'),
    router = express.Router();

// Handle POST
router.post('/', function (req, res) {
    var body = req.body;
    RedFlag.create(body, function (err, red_flag) {
        if (err) {
            return res.status(500).send({error: err});
        }
        else {
            res.status(200).send(red_flag);
        }
    });
});

// Handle GET all words
router.get('/', function (req, res) {
    RedFlag.find({}, function (err, red_flags) {
        if (err) {
            // Handle database error
            return res.status(500).send({
                error: err
            });
        }
        // Send results
        res.status(200).send(red_flags);
    });
});

// Handle GET a specified word
router.get('/:word', function (req, res) {
    RedFlag.findOne({original: req.params.word}, function (err, red_flag) {
        if (err) {
            // Handle database error
            return res.status(500).send({
                error: err
            });
        }
        if (!red_flag) {
            // Send 404 when image not found.
            return res.status(404).send({error: 'Word not found.'});
        }
        // Send results
        res.status(200).send(red_flag);
    });
});


module.exports = router;