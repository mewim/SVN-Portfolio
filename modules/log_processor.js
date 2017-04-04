/*
 * Process SVN logs
 */

module.exports = {
    /**
     * Build a dictionary that maps each project to its paths and commit history
     * @param {Object} log - output of parse_log
     * @return {Object} commit_dict
     */
    build_commit_dict: function (log) {
        var commit_dict = {};
        for (var i = 0; i < log.length; ++i) {
            var paths = log[i].paths;
            for (var j = 0; j < paths.length; ++j) {
                var paths_arr = paths[j].path.split('/').slice(2);
                var relative_path = paths_arr.join('/');
                if (paths_arr[0]) {
                    if (!(paths_arr[0] in commit_dict)) {
                        commit_dict[paths_arr[0]] = {};
                    }
                    if (!commit_dict[paths_arr[0]][relative_path]) {
                        commit_dict[paths_arr[0]][relative_path] = [];
                    }
                    commit_dict[paths_arr[0]][relative_path].push({
                        "revision": parseInt(log[i].revision),
                        "author": log[i].author,
                        "date": new Date(log[i].date),
                        "msg": log[i].msg,
                        "action": paths[j].action
                    });
                }
            }
        }
        return commit_dict;
    },

    /**
     * Get detailed information for each project
     * @param {Object} commit_dict - output of build_commit_dict
     * @return {Object} project_info
     */
    get_project_info: function (commit_dict) {
        var project_info = {};
        for (var project in commit_dict) {
            var latest_revision = -1,
                description = null,
                latest_commit_date = null,
                earliest_commit_date = null;
            var paths = commit_dict[project];
            for (var path in paths) {
                for (var i = 0; i < paths[path].length; ++i) {
                    var commit = paths[path][i];
                    earliest_commit_date = (!earliest_commit_date) ?
                        commit.date :
                        (
                            (commit.date < earliest_commit_date) ?
                                commit.date : earliest_commit_date
                        );
                    latest_commit_date = (!latest_commit_date) ?
                        commit.date :
                        (
                            (commit.date > latest_commit_date) ?
                                commit.date : latest_commit_date
                        );
                    latest_revision = (latest_commit_date === commit.date) ? commit.revision : latest_revision;
                    description = (latest_commit_date === commit.date) ? commit.msg : description;
                }
            }
            project_info[project] = {
                'latest_revision': latest_revision,
                'description': description,
                'latest_commit_date': latest_commit_date,
                'earliest_commit_date': earliest_commit_date
            }
        }
        return project_info;
    }
};