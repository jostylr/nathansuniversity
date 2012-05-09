/*globals module, require, console, exports*/

var fs = require('fs');

var pegjs = require('pegjs');

var scheem = pegjs.buildParser(fs.readFileSync("scheem.peg", "utf8")); 

var parser = scheem.parse;

var evalScheem = require('./evalScheem').evalScheem;

module.exports = function (str) {
  console.log(str);
  console.log(parser(str))
  return evalScheem(parser(str));
}