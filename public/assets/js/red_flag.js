// Init global variables
var words_table = null;
var word_dict = {};

/**
 * Add red flag words to database
 * Callback function for button click
 */
const add = function () {
    var original = $('#original').val();
    var replaced = $('#replaced').val();
    if (!original) {
        return alert('Missing original word.');
    }
    if (original in word_dict) {
        return alert('The word exists already.');
    }
    if (!replaced) {
        return alert('Missing replacement word.');
    }
    $.ajax({
        url: '/api/red_flag',
        type: 'POST',
        data: JSON.stringify({
            original: original,
            replaced: replaced
        }),
        contentType: "application/json; charset=utf-8",
        success: function (word) {
            add_word(word);
            alert('Word is saved to database.');
        },
        error: function (xhr, status, error) {
            alert('There is a network error, please try again later.');
        }
    });
};

const add_word = function (word) {
    words_table.row.add([
        $('<p>').text(word.original).html(),
        $('<p>').text(word.replaced).html()
    ]).draw();
    word_dict[word.original] = word.replaced;

};

// Construct jQuery datatable when document is ready
$(document).ready(function () {
    words_table = $('#words').DataTable();
    $.get('/api/red_flag')
        .done(function (red_flags) {
            for (var i = 0; i < red_flags.length; ++i) {
                add_word(red_flags[i]);
            }
        });
});