var fs = require('fs');

var dir = '../../nathan-ghpages/tortoise/';

//generate parser
var pegjs = require('pegjs');

var scheem = pegjs.buildParser(fs.readFileSync("tort.peg", "utf8")); 

fs.writeFileSync(dir + "node_modules/tort.js", "module.exports = "+ scheem.toSource(), "utf8");


//copy over evaltort  
fs.writeFileSync(dir + "node_modules/evaltort.js", fs.readFileSync("evaltort.js"));


exec = require('child_process').exec;
exec("browserify -e entry.js -o run.js", {cwd:dir}, function (err, out, oerr) {
  //exec("uglifyjs --overwrite run.js", {cwd:dir}, function (err, out, oerr) {});
});


/*
//copy over test
temp = fs.readFileSync("test/evaltest.js", "utf8").replace("var evaltort = require('../evaltort');", "var evaltort = require('evaltort');");
fs.writeFileSync(dir + "node_modules/evaltest.js", temp, "utf8");

temp = fs.readFileSync("test/pegtest.js", "utf8").replace("var runT = require('../run');", "var runT = require('run');");
fs.writeFileSync(dir + "node_modules/pegtest.js", temp, "utf8");

exec = require('child_process').exec;
exec("browserify -e test_entry.js -o test_go.js", {cwd:dir}, function (err, out, oerr) {
  exec("uglifyjs --overwrite test_go.js", {cwd:dir}, function (err, out, oerr) {});
});

exec("browserify -e entry.js -o run.js", {cwd:dir}, function (err, out, oerr) {
  exec("uglifyjs --overwrite run.js", {cwd:dir}, function (err, out, oerr) {});
});
*/