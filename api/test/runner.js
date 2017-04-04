var assert = require('assert');
var request = require('sync-request');
const API = 'http://localhost:5000/api/';
const UPVOTE = API + 'vote/u/';
const DOWNVOTE = API + 'vote/d/';
const POST = API + 'comment';


describe('vote', function () {
    var id_1;
    var res = request(
        'POST',
        POST, {
            json: {
                content: 'test1',
                path: '/test'
            }
        });
    res = (JSON.parse(res.body));
    assert(res.content == 'test1');
    assert(res.level == 0);
    assert(res.path == '/test');
    assert(res.username == 'Anonymous');
    id_1 = res._id;

    var id_2;
    res = request(
        'POST',
        POST, {
            json: {
                content: 'test2',
                path: '/test'
            }
        });
    res = (JSON.parse(res.body));
    assert(res.content == 'test2');
    assert(res.level == 0);
    assert(res.path == '/test');
    assert(res.username == 'Anonymous');
    id_2 = res._id;


    it('Upvote for comment', function () {
        res = request(
            'GET',
            UPVOTE + id_1);
        res = (JSON.parse(res.body));
        assert(res.success == true);
    });

    it('Downvote for comment', function () {
        res = request(
            'GET',
            DOWNVOTE + id_1);
        res = (JSON.parse(res.body));
        assert(res.success == true);
    });

    it('Reject upvote for non-exist comment', function () {
        res = request(
            'GET',
            UPVOTE + 'non-exist');
        res = (JSON.parse(res.body));
        assert(res.success == false);
        assert(res.message == 'You are voting for a non-exist comment. 😂');
    });

    it('Reject downvote for non-exist comment', function () {
        res = request(
            'GET',
            DOWNVOTE + 'non-exist');
        res = (JSON.parse(res.body));
        assert(res.success == false);
        assert(res.message == 'You are voting for a non-exist comment. 😂');
    });

    it('Allow vote for up to 20 times per IP per vote', function () {
        var i;
        for (i = 0; i < 12; ++i) {
            res = request(
                'GET',
                DOWNVOTE + id_2);
            res = (JSON.parse(res.body));
            assert(res.success == true);
        }
        for (i = 0; i < 8; ++i) {
            res = request(
                'GET',
                UPVOTE + id_2);
            res = (JSON.parse(res.body));
            assert(res.success == true);
        }
    });

    it('Reject upvote after 20 times per IP per vote', function () {
        res = request(
            'GET',
            UPVOTE + id_2);
        res = (JSON.parse(res.body));
        assert(res.success == false);
        assert(res.message == 'You are spam clicking. 😂');
    });

    it('Reject downvote after 20 times per IP per vote', function () {
        res = request(
            'GET',
            DOWNVOTE + id_2);
        res = (JSON.parse(res.body));
        assert(res.success == false);
        assert(res.message == 'You are spam clicking. 😂');
    });
});
