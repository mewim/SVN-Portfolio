/**
 * Add a portfolio to select
 * @param {String} portfolio_description
 * @return {String} portfolio_path
 */

const add_portfolio = function (portfolio_description, portfolio_path) {
    $('#portfolio_select').append($('<option/>', {
        value: portfolio_path,
        text: portfolio_description
    }));
};

/**
 * Lead user to the portfolio page
 */
const go = function () {
    var selected = $('#portfolio_select option:selected').val();
    if (selected != '0') {
        window.location = '/portfolio/#' + selected;
    }
};


$(document).ready(function () {
    // Load all project information and add them to web page
    $.get("/data/portfolios.json")
        .done(function (portfolios) {
            $('#portfolio_select').empty();
            for (var portfolio_description in portfolios) {
                add_portfolio(portfolio_description, portfolios[portfolio_description]);
            }
        });
});