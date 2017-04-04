/*
 * Convert xml file to JSON, without changing the main structure of data
 */

const xml2js = require('xml2js');

module.exports = {
    /**
     * Parse svn_list.xml
     * @param {String} list - content of svn_list.xml
     * @param {Function} callback
     */
    parse_list: function (list, callback) {
        var parser = new xml2js.Parser();
        parser.parseString(list, function (error, result) {
            if (!error) {
                var svn_root = result.lists.list[0]['$'].path + '/';
                var raw_entries = result.lists.list[0].entry,
                    files_list = [];
                for (var i = 0; i < raw_entries.length; ++i) {
                    var entry = raw_entries[i];
                    var size = entry['size']? parseInt(entry['size'][0]):-1;
                    files_list.push({
                        'kind': entry['$']['kind'],
                        'name': entry['name'][0],
                        'size': size,
                        'commit': {
                            'revision': entry['commit'][0]['$']['revision'],
                            'author': entry['commit'][0]['author'][0],
                            'date': new Date(entry['commit'][0]['date'][0])
                        }
                    });
                }
                callback({
                    'list': files_list,
                    'svn_root': svn_root
                });
            }
            else {
                callback(null);
            }

        });
    },

    /**
     * Parse svn_log.xml
     * @param {String} log - content of svn_log.xml
     * @param {Function} callback
     */
    parse_log: function (log, callback) {
        var parser = new xml2js.Parser();
        parser.parseString(log, function (error, result) {
            if (!error) {
                var raw_entries = result.log.logentry,
                    log_list = [];
                for (var i = 0; i < raw_entries.length; ++i) {
                    var entry = raw_entries[i];
                    var processed = {
                        'revision': entry['$']['revision'],
                        'author': entry['author'][0],
                        'date': new Date(entry['date'][0]),
                        'msg': (entry['msg'])?entry['msg'][0]:"(No commit Message)",
                        'paths': []
                    };
                    var raw_paths = entry['paths'][0]['path'];
                    for (var j = 0; j < raw_paths.length; ++j) {
                        processed.paths.push({
                            path: raw_paths[j]['_'],
                            kind: raw_paths[j]['$']['kind'],
                            action: raw_paths[j]['$']['action']
                        });
                    }
                    log_list.push(processed);
                }
                callback(log_list);
            }
            else {
                callback(null);
            }
        });
    }
};