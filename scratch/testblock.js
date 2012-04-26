/*globals module, require, console, exports*/

var fs = require('fs');

var pegjs = require('pegjs');


var parserTests = {
  quick : function (test) {
    var par = this.par;
    test.deepEqual( par("a\n"), ["a"], "a\n");
    test.deepEqual( par("a\nb\nc\n"), [ 'a', [ 'b', 'c' ] ], "a\nb\nc\n");
    test.deepEqual(par(":a\nb\nc\n;;"), [ 'a', [ 'b', 'c' ], 2 ] , ":a\nb\nc\n;;" )
    
    test.done();
  }
};

var clone = function (obj) {
  var ret = {};
  var key; 
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      ret[key] = obj[key];      
    }
  }
  return ret;
};



makePar = function (fname, tname) {
  var par = clone(parserTests);

  par.setUp = function (cb) {
    var text = fs.readFileSync(fname, "utf8");
    try {
      var scheem = pegjs.buildParser(text); 
    } catch (e) {
      console.log("parser failed", e);
      throw e
    }
    this.par = function (str, start) {
      try {
        return scheem.parse(str, start);
      } catch (e) {
        console.log(e);
        return undefined;
      }
    };  
    cb();
  };

  exports[tname] = par;  
};

makePar("block.peg", "block");  
  
