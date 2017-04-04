/*
 * API for image
 */
const express = require('express'),
    router = express.Router();
const fileupload = require('express-fileupload');
const Image = require('../models/image');

// Limit the max size of received data to 401 KiB
router.use(fileupload({
    limits: {fileSize: 401 * 1024}
}));

// Handle POST
router.post('/', function (req, res) {
    // Check for null case
    if (!req.files) {
        return res.status(400).send({
            success: false,
            message: 'No image is uploaded.'
        });
    }
    // Extract the picture
    var picture = req.files.picture;
    // Reject image > 400 Kib
    if (picture.data.length > 400 * 1024) {
        return res.status(400).send({
            success: false,
            message: 'Image size is too large.'
        });
    }
    Image.create({data: picture.data, type: picture.mimetype}, function (err, img) {
        if (err) {
            // Handle database error
            return res.status(500).send({
                success: false,
                message: err
            });
        }
        else {
            res.status(200).send({
                success: true,
                message: 'Image uploaded.',
                image_id: img._id
            });
        }
    });
});

// Handle GET
router.get('/:image_id', function (req, res) {
    Image.findOne({_id: req.params.image_id}, function (err, img) {
        if (err) {
            // Handle database error
            return res.status(500).send({
                error: err
            });
        }

        if (!img) {
            // Send 404 when image not found.
            return res.status(404).send({error: 'No image found.'});
        }
        // Send image
        res.contentType(img.type);
        res.status(200).send(img.data);
    });
});

module.exports = router;