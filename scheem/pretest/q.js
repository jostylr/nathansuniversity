/*globals module, require, console, exports*/

var _ = require('underscore');

var evalScheem = require('../evalScheem').evalScheem;


module.exports.suites = { 
  add : evalScheem
  , quote : evalScheem
};


//----
var data = {};
   
module.exports.data = data;
