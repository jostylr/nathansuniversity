/*globals module, require, console, exports*/

var util = require('util');
var fs = require('fs');

var pegjs = require('pegjs');

var p = pegjs.buildParser(fs.readFileSync("mapeg.peg", "utf8"));

var parser = p.parse;

var test = function (arg) {
  console.log(arg, "\nResult:", util.inspect(parser(arg), null, null));
};

test("3");

test("2+3+5\n3 5 6 7\n (43 )\n {\n4 [ 5 ]\n 5 7 }\n 3 {\n 8 9, 10 )");

test("while (5 < 6) {\n 2+4 \n i = 7 +3 \n}");

test("|43 + 12|");

test("|43 - |12 + 36| | * ||A||");

test("11223344556677889911223344.123453813492134");

test("34.12E3"); //34120, 3412E1