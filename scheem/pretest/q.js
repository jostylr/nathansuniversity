/*globals module, require, console, exports*/

var _ = require('underscore');

var evalScheem = require('../evalScheem').evalScheem;


module.exports.suites = { evalScheem : evalScheem};


//----
 var data = { evalScheem: 
   { number: { inp: [ 3, {} ], out: 3 },
     dog: { inp: [ [ 'quote', 'dog' ], {} ], out: 'dog' } } };
if (module) {
 module.exports.data = data;
}