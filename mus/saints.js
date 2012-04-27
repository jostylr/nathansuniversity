/*globals module, require, console, exports*/

var fs = require('fs');

var pegjs = require('pegjs');

var pt = fs.readFileSync("mus.peg", "utf8");
try {
  var muspeg = pegjs.buildParser(pt); 
} catch (e) {
  console.log("parser failed", e);
  throw e
}

var text = fs.readFileSync("saints.txt", "utf8");

fs.writeFileSync("saints.mus", JSON.stringify(muspeg.parse(text)));

 //Saints go marching in, http://www.8notes.com/scores/433.asp