/*
 * Handles user interface manipulation for the comment webpage.
 */
//----------------------------------------------------------------------------//
// Define template strings
//----------------------------------------------------------------------------//
const COMMENT_TEMPLATE =
    '<li class="list-group-item">'
    + '    <div>'
    + '        <h4 class="comment_title">'
    + '        </h4>'
    + '        <div class="comment_text">'
    + '        </div>'
    + '        <div class="image_wrapper" style="display: none;">'
    + '            <br>'
    + '            <img class="img-thumbnail">'
    + '        </div>'
    + '    </div>'
    + '    <div class="clearfix">'
    + '        <div class="pull-right">'
    + '            <p>'
    + '                <br>'
    + '                <div class="comment_buttons">'
    + '                <i class="reply fa fa-reply" aria-hidden="true" style="cursor: pointer;"></i>&emsp;'
    + '                <span class="badge">0</span>&emsp;'
    + '                <i class="upvote fa fa-thumbs-up" aria-hidden="true" style="cursor: pointer;"></i>&emsp;'
    + '                <i class="downvote fa fa-thumbs-down" aria-hidden="true" style="cursor: pointer;"></i>'
    + '                </div>'
    + '            </p>'
    + '        </div>'
    + '    </div>'
    + '    <ul class="children_comments" style="display: none;">'
    + '    </ul>'
    + '</li>';

const NO_COMMENT_TEMPLATE = '<h3>There is no comment to show.</h3>';

const LOADER_TEMPLATE =
    '<div class="huge">'
    + '   <div class="loader"></div>'
    + '</div>'
    + '<br>'
    + '<h4 style = "text-align:center" > Loading... </h4>';
//----------------------------------------------------------------------------//

//----------------------------------------------------------------------------//
// Define Helper functions
//----------------------------------------------------------------------------//
/**
 * Enable the green refresh button on webpage
 */
const enable_refresh = function () {
    var button_dom = $('#reload_button');
    button_dom.prop('disabled', false);
    var icon = button_dom.find('i').first();
    icon.removeClass('fa-spin');
};

/**
 * Disable the green refresh button on webpage
 */
const disable_refresh = function () {
    var button_dom = $('#reload_button');
    button_dom.prop('disabled', true);
    var icon = button_dom.find('i').first();
    icon.addClass('fa-spin');
};

/**
 * Generate HTML template for a Bootstrap red alert message
 * @param {String} message
 * @return {String} html
 */
const red_alert = function (message) {
    return (
        '<div class="alert alert-danger"> <i class="fa fa-exclamation-circle"></i> '
        + message
        + '</div>'
    );
};

/**
 * Generate HTML template for a Bootstrap blue alert message
 * @param {String} message
 * @return {String} html
 */
const blue_alert = function (message) {
    return (
        '<div class="alert alert-info"> <i class="fa fa-info-circle"></i> '
        + message
        + '</div>'
    );
};

/**
 * Generate HTML template for a Bootstrap green alert message
 * @param {String} message
 * @return {String} html
 */
const green_alert = function (message) {
    return (
        '<div class="alert alert-success"> <i class="fa fa-info-circle"></i> '
        + message
        + '</div>'
    );
};

/**
 * Clear the comment container, set 'loading' to 'completed' status
 */
const clear_comment_container = function () {
    loading = false;
    $('#comment_container').html('');
};

/**
 * Generate <li> DOM for comment
 * @param {Object} comment
 * @return {Object} dom
 */
const generate_comment_dom = function (comment) {
    var comment_dom = $($.parseHTML(COMMENT_TEMPLATE));
    comment_dom.attr('id', comment._id);
    comment_dom.find('.comment_title').text(
        'On ' + moment(comment.date).format('YYYY-MM-DD HH:mm')
        + ', '
        + comment.username + ' said:'
    );

    comment_dom.find('.comment_text').text(comment.content);
    comment_dom.find('.badge').text(comment.votes);

    if (comment.img_id) {
        comment_dom.find('.img-thumbnail').attr('src', '/img/' + comment.img_id);
        comment_dom.find('.image_wrapper').show();
    }
    return comment_dom;
};

/**
 * Extract comment id for a given reply/upvote/downvote button dom
 * @param {Object} dom
 * @return {String} id
 */
const get_id = function (dom) {
    return $(dom).parents().eq(3).attr('id');
};

/**
 * Add event listeners for reply/upvote/downvote button
 * @param {String} id - optional parameter, if it is set, the listeners will be added to selected <li> only
 */
const handle_on_click = function (id) {
    var reply_dom = id ? $("#" + id).find(".reply").first() : $(".reply");
    var upvote_dom = id ? $("#" + id).find(".upvote").first() : $(".upvote");
    var downvote_dom = id ? $("#" + id).find(".downvote").first() : $(".downvote");
    reply_dom.click(function () {
        reply(get_id(this));
    });
    upvote_dom.click(function () {
        vote(get_id(this), true);
    });
    downvote_dom.click(function () {
        vote(get_id(this), false);
    });
};

/**
 * Show a comment on the webpage
 * @param {Object} comment
 */
const show_comment = function (comment) {
    var comment_dom = generate_comment_dom(comment);
    if (comment.level == 0) {
        $(comment_dom).appendTo('#comment_container');
    }
    else {
        var subcomment_ul = $('#' + comment.parent).find('.children_comments').first().show();
        comment_dom.appendTo(subcomment_ul);
    }
};

/**
 * Show all comments stored in 'comment_sorted'
 */
const show_all_comments = function () {
    clear_comment_container();
    if (comment_sorted.length == 0) {
        $('#comment_container').html(NO_COMMENT_TEMPLATE);
    }
    else {
        for (var level = 0; level < comment_sorted.length; ++level) {
            for (var i = 0; i < comment_sorted[level].length; ++i) {
                show_comment(comment_sorted[level][i]);
            }
        }
        handle_on_click();
    }
};

/**
 * Submit comment (with an optional image) to API
 * @param {Object} comment
 * @param {Object} image
 */
const submit_comment = function (comment, image) {
    // If there is an image, upload it first
    if (image) {
        submit_picture_ajax(image, function (img_id) {
            if (img_id) {
                comment.img_id = img_id;
                submit_comment_ajax(comment);
            }
        });
    }
    else {
        submit_comment_ajax(comment);
    }
};
//----------------------------------------------------------------------------//

//----------------------------------------------------------------------------//
// Define Callback functions for user interactions
//----------------------------------------------------------------------------//
/**
 * Reset comment post form
 * Onclick callback for reset button
 */
const reset = function () {
    $('#comment').val('');
    $('#image_upload').val('');
    $('#filename').text('');
    $('#info').html(blue_alert(
        'You can optionally attach an image to your comment (Max Size: 400KiB)'
    ));
};

/**
 * Show the popup for writing a new comment
 * Onclick callback for new comment button
 */
const new_comment = function () {
    if (loading) {
        return;
    }
    comment = {
        path: path
    };
    reset();
    $('#write_comment').modal('show');
};

/**
 * Show the popup for replying to a new comment
 * Onclick callback for reply button
 */
const reply = function (parent_id) {
    comment = {
        path: path,
        parent: parent_id,
        level: comment_dict[parent_id].level + 1
    };
    reset();
    $('#write_comment').modal('show');
};

/**
 * Submit a new comment to the API
 * Onclick callback for submit button
 */
const submit = function () {
    var input_content = $('#comment').val();
    if (!input_content) {
        // Check if the comment content is not empty
        return $('#info').html(red_alert(
            'Please enter your comment.'
        ));
    }
    comment.content = input_content;
    var input_username = $('#username').val();
    if (input_username) {
        comment.username = input_username;
    }
    var image = $('#image_upload').prop('files')[0];
    // If there is an image, check if the image is valid
    if (image) {
        // Check if the image size <= 400KiB
        if (image.size > 400 * 1024) {
            return $('#info').html(red_alert(
                'Max Size for image is 400KiB.'
            ));
        }
        // Check if the image is really an image
        if (!image.type.toLowerCase().includes('image')) {
            return $('#info').html(red_alert(
                'The file you selected is not a valid image file.'
            ));
        }
    }
    submit_comment(comment, image);
};

/**
 * Submit an upvote/downvote to the API
 * Onclick callback for upvote/downvote button
 */
const vote = function (id, up) {
    submit_vote_ajax(id, up);
};

/**
 * Submit an upvote/downvote to the API
 * Onclick callback for upvote/downvote button
 */
const reload = function () {
    $('#comment_container').html(LOADER_TEMPLATE);
    disable_refresh();
    load_comments_ajax(function (comments) {
        traverse_comments(comments);
        sort_comments();
        enable_refresh();
    });
};

/**
 * Sort comments based on user selected option
 * Onchange callback for sorting drop down selector
 */
const sort_comments = function () {
    var option = parseInt($('#portfolio_select').find(":selected").val());
    switch (option) {
        case 0:
            do_sort('date', false);
            break;
        case 1:
            do_sort('date', true);
            break;
        case 2:
            do_sort('votes', false);
            break;
        case 3:
            do_sort('votes', true);
            break;
        case 4:
            count_subcomments();
            do_sort('subcomments_count', false);
            break;
        case 5:
            count_subcomments();
            do_sort('subcomments_count', true);
            break;
        default:
            break;
    }
    show_all_comments();
};
//----------------------------------------------------------------------------//

//----------------------------------------------------------------------------//
// Start loading when document is ready
//----------------------------------------------------------------------------//
$(document).ready(function () {
    // Load all project information and add them to web page
    $('#path').text(path);
    reload();
});
//----------------------------------------------------------------------------//