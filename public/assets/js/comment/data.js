/*
 * Handles data manipulation for the comment webpage.
 */
//----------------------------------------------------------------------------//
// Define global variables
//----------------------------------------------------------------------------//
var comment_dict = {};
var comment_sorted = [];
var comment = null;
var loading = true;
var path = window.location.hash ? (window.location.hash.substring(1)) : null;
//----------------------------------------------------------------------------//

//----------------------------------------------------------------------------//
// Define functions
//----------------------------------------------------------------------------//
/**
 * Add a comment to the global data structures
 * @param {Object} comment
 */
const add_comment = function (comment) {
    comment_dict[comment._id] = comment;
    if (!comment_sorted[comment.level]) {
        comment_sorted[comment.level] = [comment];
    }
    else {
        comment_sorted[comment.level].push(comment);
    }
};

/**
 * Traverse all comments, add it to the global data structures
 * @param {[Object]} comments
 */
const traverse_comments = function (comments) {
    comment_dict = {};
    comment_sorted = [];
    for (var i = 0; i < comments.length; ++i) {
        add_comment(comments[i]);
    }
};

/**
 * Sort comments in 'comment_sorted' by field
 * @param {String} field
 * @param {Boolean} reverse
 */
const do_sort = function (field, reverse) {
    for (var level = 0; level < comment_sorted.length; ++level) {
        comment_sorted[level].sort(function (a, b) {
            return (a[field] > b[field] ) ?
                1 : -1
        });
        if (reverse) {
            comment_sorted[level].reverse();
        }
    }
};

/**
 * Count number of subcomments for each comment
 */
const count_subcomments = function () {
    for (comment_id in comment_dict) {
        comment_dict[comment_id].subcomments_count = 0;
    }
    for (var level = comment_sorted.length - 1; level >= 0; --level) {
        for (var i = 0; i < comment_sorted[level].length; ++i) {
            var curr_comment = comment_sorted[level][i];
            var parent_comment = comment_dict[curr_comment.parent];
            if (parent_comment) {
                parent_comment.subcomments_count += (curr_comment.subcomments_count + 1);
            }
        }
    }
};
//----------------------------------------------------------------------------//