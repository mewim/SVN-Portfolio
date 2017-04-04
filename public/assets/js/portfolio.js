var portfolio_name = window.location.hash ? (window.location.hash.substring(1)) : null;

/**
 * Add a project to webpage
 * @param {String} project_name
 * @return {Object} project_info
 */

const add_project = function (project_name, project_info) {
    var html =
        '<div class="col-lg-12">'
        + '<div class="panel panel-default">'
        + '<div class="panel-heading">'
        + '<i class="fa fa-file-code-o"></i> '
        + project_name
        + '</div>'
        + '<div class="panel-body">'
        + '<table class="table" style=" margin: 0">'
        + '<tbody>'
        + '<tr>'
        + '<th class="col-md-3">First Commit Date</th>'
        + '<td>'
        + moment(project_info.earliest_commit_date).format('YYYY-MM-DD HH:mm')
        + '</td>'
        + '</tr>'
        + '<tr>'
        + '<th class="col-md-3">Last Commit Date</th>'
        + '<td>'
        + moment(project_info.latest_commit_date).format('YYYY-MM-DD HH:mm')
        + '</td>'
        + '</tr>'
        + '<tr>'
        + '<th class="col-md-3">Version</th>'
        + '<td>'
        + project_info.latest_revision
        + '</td>'
        + '</tr>'
        + '<tr>'
        + '<th class="col-md-3">Summary</th>'
        + '<td>'
        + project_info.description
        + '</td>'
        + '</tr>'
        + '</tbody>'
        + '</table>'
        + '</div>'
        + '<div class="panel-footer">'
        + '<a class="btn btn-primary" href="'
        + '/project/#' + portfolio_name + '/' + project_name
        + '">View Files ></a> &emsp;'
        + '<a class="btn btn-success" href="'
        + '/comment/#' + portfolio_name + '/' + project_name
        + '">Read Comments ></a>'
        + '</div>'
        + '</div>'
        + '</div>';
    $(html).hide().appendTo('#page-wrapper').slideDown('slow');
};

$(document).ready(function () {
    // Load all project information and add them to web page
    $.get('/data/' + portfolio_name + '/projects.json')
        .done(function (projects) {
            for (var project_name in projects) {
                add_project(project_name, projects[project_name]);
            }
        });

});