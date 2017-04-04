const fs = require('fs');
const P = require('./modules/preprocessor');
const execSync = require('child_process').execSync;

const DATA_ROOT = './public/data/';

// Process args
const args = process.argv.slice(2);
var PORTFOLIO_NAME = args[0], XML_PATH = args[1], PORTFOLIO_DESCRIPTION = args[2];

if (!PORTFOLIO_NAME || !XML_PATH) {
    P.exit_error('Usage: node preprocess <Portfolio Name> <XML Path> <Portfolio Description (optional)>');
}
PORTFOLIO_DESCRIPTION = (PORTFOLIO_DESCRIPTION) ? PORTFOLIO_DESCRIPTION : PORTFOLIO_NAME;

// Try to load old portfolios JSON file.
var portfolios = {};
try {
    var old_portfolios = fs.readFileSync(DATA_ROOT + 'portfolios.json', 'utf-8');
    portfolios = JSON.parse(old_portfolios);
    console.log('Old portfolio file successfully loaded.')
}
catch (err) {
    execSync('rm -rf ' + DATA_ROOT + 'portfolios.json');
    console.log('Old portfolio file is missing or invalid, replacing with a new file.')
}

// Update portfolios JSON file.
portfolios[PORTFOLIO_DESCRIPTION] = PORTFOLIO_NAME;
P.write_to_file(portfolios, DATA_ROOT + 'portfolios.json');

// Remove old files.
execSync('rm -rf ' + DATA_ROOT + PORTFOLIO_NAME);
console.log('Old files removed successfully!');

// Make new directory.
var new_directory = DATA_ROOT + PORTFOLIO_NAME + '/';
execSync('mkdir ' + new_directory);
execSync('mkdir ' + new_directory + 'project');
console.log('New directory is created.');

P.process(XML_PATH, new_directory);