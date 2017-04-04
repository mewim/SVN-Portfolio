var P = require('../preprocessor'),
    fs = require('fs'),
    assert = require('assert');
const XML_Parser = require('../xml_parser');
const List_Processor = require('../list_processor');
const Log_Processor = require('../log_processor');
const execSync = require('child_process').execSync;

var list_raw = fs.readFileSync('../data/xml/' + 'svn_list.xml', 'utf-8');
var log_raw = fs.readFileSync('../data/xml/' + 'svn_log.xml', 'utf-8');

describe('XMLParser', function () {
    it('should parse list without error', function () {
        XML_Parser.parse_list(list_raw, function (result_1) {
            assert(result_1);
            assert(result_1.svn_root == 'https://subversion.ews.illinois.edu/svn/sp17-cs242/cliu81/')
            assert(JSON.stringify(result_1.list[0]) == '{"kind":"dir","name":"Assignment0","size":-1,"commit":{"revision":"2675","author":"cliu81","date":"2017-01-31T20:32:58.574Z"}}');
        });
    });

    it('should parse log without error', function () {
        XML_Parser.parse_log(log_raw, function (result_2) {
            assert(result_2[0].revision == 6614);
            assert(result_2[0].author == 'cliu81');
            for (var i = 0; i < result_2.length; ++i) {
                assert(result_2[0].revision);
                assert(result_2[0].author);
            }

        });
    });
});

describe('ListProcessor', function () {
    it('should process parsed list without error', function () {
        XML_Parser.parse_list(list_raw, function (result_1) {
            var list = result_1.list;
            var svn_root = result_1.svn_root;

            var raw_tree = List_Processor.build_tree(list);
            var jsTrees = List_Processor.output_jsTrees(raw_tree);
            var size_dict = List_Processor.extract_size(list);
            assert(raw_tree);
            assert(jsTrees);
            assert(size_dict);
            assert(raw_tree['Assignment0']);
            assert(raw_tree['Assignment1.0']);
            assert(raw_tree['Assignment1.0']['src']);
            assert(size_dict['Assignment2.0']);
            assert(size_dict['Assignment0']);
            assert(size_dict['Assignment0']['Assignment0/alloc.c'] == 11864);
        });
    });


});

describe('ListProcessor', function () {
    it('should process parsed log without error', function () {
        XML_Parser.parse_log(log_raw, function (log) {
            var commit_dict = Log_Processor.build_commit_dict(log);
            var project_info = Log_Processor.get_project_info(commit_dict);
            assert(commit_dict);
            assert(commit_dict['Assignment0'])
            assert(JSON.stringify(commit_dict['Assignment0']) == '{"Assignment0":[{"revision":2675,"author":"cliu81","date":"2017-01-31T20:32:58.574Z","msg":"Bring code","action":"A"}],"Assignment0/alloc.c":[{"revision":2675,"author":"cliu81","date":"2017-01-31T20:32:58.574Z","msg":"Bring code","action":"A"}]}');
            assert(project_info);
            assert(project_info['Assignment2.1']);
            assert(JSON.stringify(project_info['Assignment2.1']) == '{"latest_revision":6614,"description":"Assignment 2.1 api","latest_commit_date":"2017-03-07T22:04:46.590Z","earliest_commit_date":"2017-03-07T16:26:45.717Z"}');
        });
    });
});

describe('Preprocessor', function () {

    it('should process xml files without error', function () {
        execSync('rm -rf /tmp/project');
        execSync('mkdir /tmp/project');
        P.process('../data/xml/', '/tmp/');
    });
});