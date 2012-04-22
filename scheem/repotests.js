/*globals module, require, console, exports*/

var fs = require('fs');
var nu = require('nodeunit');
var load = require('./load');

var pegjs = require('pegjs');

var ref = fs.readFileSync("bm.scm", "utf8");

var parserTests = {
  basics: function (test) {
    var par = this.par;
    test.expect(6);
    test.equal(par(""), undefined, "don't parse empty string");
    test.deepEqual(par("@"), "@", "single char @");
    test.deepEqual(par("atom"), "atom", "word");
    test.deepEqual(par("(a b c)"), ["a", "b", "c"], "abc");
    test.deepEqual(par("(+ x 3)"), ["+", "x", "3"], "parse (+ x 3)");
    test.deepEqual(par("(+ 1 (f x 3 y))"), ["+", "1", ["f", "x", "3", "y"]], "parse (+ 1 (f x 3 y))");
    test.done();
  }
  , space : function (test) {
    var par = this.par;
    test.expect(6);
    test.equal(par(" "), undefined, "don't parse white space only string");
    test.deepEqual(par(" @"), "@", " @");
    test.deepEqual(par("atom "), "atom", "atom ");
    test.deepEqual(par(" ( a   b  c   ) "), ["a", "b", "c"], " ( a   b  c   ) ");
    test.deepEqual(par("(+ \t x \n 3)"), ["+", "x", "3"], "parse (+ \t x \n 3)");
    test.deepEqual(par("(+ 1 \n \t (f x 3 y) \n)"), ["+", "1", ["f", "x", "3", "y"]], "(+ 1 \n \t (f x 3 y) \n)");
    test.done(); 
  }
  , quote : function (test) {
    var par = this.par;
    test.expect(3);
    test.deepEqual(par("'x"), ["quote", "x"], "'x");
    test.deepEqual(par("'(1 2 3)"), ["quote", ["1", "2", "3"]]);
    test.deepEqual(par("(+ '1 \n \t (f x 3 y) \n)"), ["+", ["quote", "1"], ["f", "x", "3", "y"]], "(+ '1 \n \t (f x 3 y) \n)");
    test.done();
  }
  , comments : function (test) {
    var par = this.par;
    test.expect(3);
    test.equal(par(";; this is a comment"), undefined, "don't parse comment only");
    test.deepEqual(par(";; first comment\nx"), "x", ";; first comment\n x");
    test.deepEqual(par("x\n;; later comment"), "x", "x\n;; later comment");
    test.done();
  }
  , reference : function (test) {
    var par = this.par;
    test.expect(1);
    test.deepEqual(par(ref), ["+", "1", "2", "f", ["x", "y", "z", ["quote", ["1", "2", "3"]]], "g", ["1", "2", "atome", "just", "kidding"]], "reference one");
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


var tests = {};

load(function (par, name) {    
    var t = tests[name] = clone(parserTests);

    t.setUp = function (cb) {
      this.par = par;
      cb();
    };
    
    try{
    nu.runSuite(name, t, {}, function (a, b) {
      var i
        , count = 0
        , failed = 0
        , n = b.length
        ;
        
      for (i = 0; i < n; i += 1 ){
        count += 1;
        if (b[i].failed() ) {
          failed += 1;
          //console.log(name, b[i].error);
        }
      }
      if (failed > 0) {
        console.log(name, failed, "failed out of", count );
      }
    });
  } catch (e) {
    console.log(name, "error");
  }
  }, function () {
    ;
  });


