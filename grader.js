#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var htmlStr = "defaultX";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlStr = function(htmlstr) {
    return cheerio.load(htmlstr);
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlStr = function(htmlstr, checksfile) {
    $ = cheerioHtmlStr(htmlstr);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

var dealByURL = function(htmlStr, checksFile) {
    logJson(checkHtmlStr(htmlStr, checksFile));
};

var dealByFile = function(htmlFile, checksFile) {
    logJson(checkHtmlStr(fs.readFileSync(htmlFile), checksFile));
};

var logJson = function(checkStr) {
    var outJson = JSON.stringify(checkStr, null, 4);
    console.log(outJson);
};

if(require.main == module) {
    program
	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-u, --url <url_string>', 'URL to page to check')
	.parse(process.argv);

    if(program.url) {
	rest.get(program.url).on('complete', function(result) {
	    if (result instanceof Error) {
		console.log('Error: ' + result.message);
	    } else {
		dealByURL(result, program.checks);
	    }
	});
    } else {
	dealByFile(program.file, program.checks);
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
