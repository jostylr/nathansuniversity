/*globals module, require, console, exports*/

var parser = require('tort').parse;
var et = require('evaltort');
var raph = require('raph');

module.exports = function (str) {
  var par = parser(str);
  //console.log(par);
  return et(par, raph.turtle());
}