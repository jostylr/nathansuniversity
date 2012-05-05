/*globals module, require, console, exports*/

var _ = require('underscore');

var evalScheem = require('../evalScheem').evalScheem;


suites = { evalScheem : evalScheem};


_ = require("underscore");

util = require("util"); 

suite("evalScheem");

test("number", function () {
 var result = suites.evalScheem.apply(null, [ 3, {} ]);
 var pass = _.isEqual(result, 3 ); 
if (!pass) {
  throw new Error (util.inspect(result) + " not equal to " + "3" + "\n     Input:  [ 3, {} ]"  );
}
}); 

test("dog", function () {
 var result = suites.evalScheem.apply(null, [ [ 'quote', 'dog' ], {} ]);
 var pass = _.isEqual(result, 'dog' ); 
if (!pass) {
  throw new Error (util.inspect(result) + " not equal to " + "'dog'" + "\n     Input:  [ [ 'quote', 'dog' ], {} ]"  );
}
}); 

