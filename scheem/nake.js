var fs = require('fs');

var dir = '../../nathan-ghpages/scheem/';

//generate parser
var pegjs = require('pegjs');

var scheem = pegjs.buildParser(fs.readFileSync("scheem.peg", "utf8")); 

fs.writeFileSync(dir + "node_modules/scheem.js", "module.exports = "+ scheem.toSource(), "utf8");

//copy over evalScheem  (run.js never changes)
fs.writeFileSync(dir + "node_modules/evalScheem.js", fs.readFileSync("evalScheem.js"));

//copy over test
temp = fs.readFileSync("test/q.js", "utf8").replace("var evalScheem = require('../evalScheem').evalScheem;", "var evalScheem = require('evalScheem').evalScheem;");
fs.writeFileSync(dir + "node_modules/q.js", temp, "utf8");

temp = fs.readFileSync("test/runT.js", "utf8").replace("var runT = require('../run');", "var runT = require('run');");
fs.writeFileSync(dir + "node_modules/runT.js", temp, "utf8");

exec = require('child_process').exec;
exec("browserify -e test_entry.js -o test_go.js", {cwd:dir}, function (err, out, oerr) {
  exec("uglifyjs --overwrite test_go.js", {cwd:dir}, function (err, out, oerr) {});
});
