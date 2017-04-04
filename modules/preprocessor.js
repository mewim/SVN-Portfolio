/*
 * Process SVN output XML files, build data structures in JSON
 */

const fs = require('fs');
const XML_Parser = require('./xml_parser');
const List_Processor = require('./list_processor');
const Log_Processor = require('./log_processor');

/**
 * Show an error message and exit program
 * @param {String} error
 */
const exit_error = function (error) {
    console.log(error);
    process.exit(1);
};

/**
 * Stringify a JSON object and write it to path
 * @param {Object} object
 * @param {String} path
 */
const write_to_file = function (object, path) {
    try {
        fs.writeFileSync(path, JSON.stringify(object), 'utf8');
        console.log(path + " has been written successfully!")
    }
    catch (error) {
        exit_error('ERROR: Cannot write ' + path + '!');
    }
};

/**
 * Merge all output to the desired data structure
 * @param {Object} jsTrees - output of output_jsTrees
 * @param {Object} commit_dict - output of build_commit_dict
 * @param {Object} project_info - output of get_project_info
 * @param {Object} size_dict - output of extract_size
 * @param {String} svn_root - output of get_project_info
 * @return {Object} merged
 */
const merge_results = function (jsTrees, commit_dict, project_info, size_dict, svn_root) {
    var merged = {
        'projects': {},
        'svn_root': {'svn_root': svn_root}
    };
    for (var project in jsTrees) {
        if (project in project_info) {
            merged.projects[project] = project_info[project];
        }
        else {
            exit_error('ERROR: There is no information for project ' + project + '!');
        }
        if (!(project in commit_dict)) {
            exit_error('ERROR: There is no commit history for project ' + project + '!');
        }
        if (!(project in size_dict)) {
            exit_error('ERROR: There is no size information for project ' + project + '!');
        }
        merged[project] = {
            'tree': jsTrees[project],
            'commits': commit_dict[project],
            'sizes': size_dict[project]
        };
    }
    return merged;
};

    /**
     * Process SVN output XML files, build data structures in JSON
     * @param {String} input_path
     * @param {String} output_path
     */
const process_file = function (input_path, output_path) {
        var list_raw, log_raw;
        try {
            list_raw = fs.readFileSync(input_path + 'svn_list.xml', 'utf-8');
            log_raw = fs.readFileSync(input_path + 'svn_log.xml', 'utf-8');
        }
        catch (error) {
            exit_error('ERROR: Cannot open xml files!');
        }

        XML_Parser.parse_list(list_raw, function (result_1) {
            var list = result_1.list;
            var svn_root = result_1.svn_root;
            XML_Parser.parse_log(log_raw, function (log) {
                if ((!list) || (!log)) {
                    exit_error('ERROR: Cannot parse xml files!');
                }
                else {
                    var raw_tree = List_Processor.build_tree(list);
                    var jsTrees = List_Processor.output_jsTrees(raw_tree);
                    var size_dict = List_Processor.extract_size(list);
                    var commit_dict = Log_Processor.build_commit_dict(log);
                    var project_info = Log_Processor.get_project_info(commit_dict);

                    var merged = merge_results(jsTrees, commit_dict, project_info, size_dict, svn_root);
                    for (var file_name in merged) {
                        var curr_path = (file_name === 'projects' || file_name === 'svn_root') ?
                            output_path : output_path + 'project/';
                        write_to_file(merged[file_name], curr_path + file_name + '.json')
                    }
                }
            });
        });
};

module.exports = {
    process: process_file,
    write_to_file: write_to_file,
    exit_error: exit_error
};