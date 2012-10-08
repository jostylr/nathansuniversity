/*globals module, require, console, exports*/

run = (function () {
  var parser = require('tort').parse;
  var et = require('evaltort');
  var Turtle = require('Turtle');

  return function (str, opt) {
    var par = parser(str);
    console.log(par);
    return et(par, new Turtle(opt));
  };  
}());
