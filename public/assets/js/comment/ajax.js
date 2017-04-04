/*
 * Handles API calls for the comment webpage.
 */
//----------------------------------------------------------------------------//
// Define functions
//----------------------------------------------------------------------------//
/**
 * Submit an image to API with jQuery AJAX
 * @param {Object} image
 * @param {Function} callback(image_id)
 */
const submit_picture_ajax = function (image, callback) {
    // Create FormData
    var form_data = new FormData();
    form_data.append('picture', image);
    // Show 'Sending your image...' on webpage
    $('#info').html(blue_alert('Sending your image...'));
    // Send the file
    $.ajax({
        url: '/img',
        data: form_data,
        processData: false,
        contentType: false,
        type: 'POST',
        success: function (img_api_res) {
            callback(img_api_res.image_id);
        },
        error: function (xhr, status, error) {
            try {
                // Try to parse API response
                var img_api_res = JSON.parse(xhr.responseText);
                // Try to display the message returned by API
                $('#info').html(red_alert(img_api_res.message));
            }

            catch (error) {
                // There is no valid API response in this case
                $('#info').html(red_alert('There is an error while uploading your image. ☹️'));
            }
            callback(null);
        }
    });
};

/**
 * Submit a comment to API with jQuery AJAX
 * @param {Object} comment
 */
const submit_comment_ajax = function (comment_to_submit) {
    $('#info').html(blue_alert('Sending your comment...'));
    $.ajax({
        url: '/api/comment',
        type: 'POST',
        data: JSON.stringify(comment_to_submit),
        contentType: "application/json; charset=utf-8",
        success: function (comment) {
            // If there was no comment before POST call, reinitialize the data structure
            if (comment_sorted.length == 0) {
                traverse_comments([comment]);
                sort_comments();
            }
            else {
                // Add comment to the data structure and show it
                add_comment(comment);
                show_comment(comment);
                handle_on_click(comment._id);
            }
            $('#info').html(green_alert('Your comment is submitted.'));
        },
        // Handle error
        error: function (xhr, status, error) {
            $('#info').html(red_alert('There is an error while posting your comment. ☹️'));
        }
    });
};

/**
 * Load comments from API with jQuery AJAX
 * @param {Function} callback(comments)
 */
const load_comments_ajax = function (callback) {
    // Load all comments with POST
    $.ajax({
        url: '/api/comment/p',
        type: 'POST',
        data: JSON.stringify({path: path}),
        contentType: "application/json; charset=utf-8",
        success: function (comments) {
            callback(comments);
        },
        // Handle error
        error: function (xhr, status, error) {
            alert('There is an error while fetching comment from server. ☹️');
            callback([]);
        }
    });
};

/**
 * Submit vote to API with jQuery AJAX
 * @param {String} id
 * @param {Boolean} up - true for upvote, false for downvote
 */
const submit_vote_ajax = function (id, up) {
    // Submit vote with GET
    $.ajax({
        url: (up ? '/api/vote/u/' : '/api/vote/d/') + id,
        type: 'GET',
        success: function (vote_res) {
            if (vote_res.success) {
                // Update 'votes' field for comment
                comment_dict[id].votes += up ? 1 : (-1);
                var comment_dom = $('#' + id);
                // Update count on badge
                comment_dom.find('.badge').first().text(comment_dict[id].votes);
                var buttons_dom = comment_dom.find('.comment_buttons').first().hide();
                // Show animation
                if (up) {
                    buttons_dom.toggle("slide", {direction: "down"}, 400);
                }
                else {
                    buttons_dom.toggle("slide", {direction: "up"}, 400);
                }
            }
            else {
                // Handle error message returned by API
                alert(vote_res.message);
            }
        },
        error: function (xhr, status, error) {
            // Handle other error
            alert('There is an error while submitting your vote. ☹️');
        }
    });
};
//----------------------------------------------------------------------------//