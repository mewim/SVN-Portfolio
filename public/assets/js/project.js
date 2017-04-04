// Init global variables
var commits = null,
    sizes = null,
    project_name = null,
    portfolio_name = null,
    base_url = null,
    commit_table = null,
    full_url = 'about:blank',
    comment_path = null;

var hash = window.location.hash ? (window.location.hash.substring(1)).split('/') : [];
portfolio_name = hash[0], project_name = hash[1];

// Make HTTP GET requests
// Fetch svn_root URL first
$.get('/data/' + portfolio_name + '/svn_root.json')
    .done(function (svn_root) {
        base_url = svn_root.svn_root;
        $.get('/data/' + portfolio_name + '/project/' + project_name + '.json')
            .done(function (data) {
                commits = data.commits;
                sizes = data.sizes;
                $('#jstree_demo_div').jstree({
                    'core': {
                        'data': [data.tree]
                    }
                });
            });
    });

/**
 * Get relative path of a node in jsTree
 * @param {Object} node
 * @return {String} path
 */
const get_path = function (node) {
    var path_arr = [];
    while (node && node.text) {
        path_arr.push(node.text);
        node = $('#jstree_demo_div').jstree(true).get_node(node.parent);

    }
    path_arr.reverse();
    return path_arr.join('/');
};

/**
 * Get description of file for a node in jsTree
 * @param {Object} node
 * @return {String} description
 */
const get_description = function (node) {
    return (node.icon == "fa fa-folder") ?
        'Directory' :
        (
            node.text.toLowerCase().includes('test') ?
                'Test Case' :
                get_file_extension_description(node.text.split('.').pop())
        )

};

/**
 * Load file to iframe
 * Callback function for button click
 */
const load_iframe = function () {
    $('#file_content').attr('src', full_url)
};

/**
 * Lead user to comment page
 * Callback function for button click
 */
const read_comments= function(){
    if(comment_path){
        window.location = '/comment/#'+comment_path;
    }
}

/**
 * Load commit history to jQuery datatable
 * @param {Object} commits
 */
const reload_table = function (commits) {
    commit_table.clear();
    for (var i = 0; i < commits.length; ++i) {
        commit_table.row.add([
            commits[i].revision,
            commits[i].author,
            commits[i].msg,
            moment(commits[i].date).format('YYYY-MM-DD HH:mm'),
        ]);
        commit_table.draw();
    }
};

// If user click on a node in jsTree, reload content on webpage
$('#jstree_demo_div').on("select_node.jstree", function (e, data) {
    var node = data.node;
    var path = get_path(node);
    var size = sizes[path];
    var description = get_description(node);
    $('#file_type').text(description).hide().fadeIn('slow');
    $('#file_path').text(path).hide().fadeIn('slow');
    $('#file_size').text(size ? size : '(Not Available)').hide().fadeIn('slow');

    full_url = base_url + path;
    comment_path = portfolio_name+'/'+path;
    reload_table(commits[path]);
});

// Change title of the webpage and construct jQuery datatable when document is ready
$(document).ready(function () {
    $('#title').text(project_name);
    commit_table = $('#commit-history').DataTable({
        "columnDefs": [
            {"orderable": false, "targets": 3}
        ]
    });
});