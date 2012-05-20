/*globals require, module*/
/*jshint asi:true */

var List = require('../list.js');

//need a little something to pass in arguments to constructor
//http://stackoverflow.com/questions/1959247/javascript-apply-on-constructor-throwing-malformed-formal-parameter
var applySecond = function () {
    function tempCtor() {}
    return function (ctor, args) {
      tempCtor.prototype = ctor.prototype;
      var instance = new tempCtor();
      ctor.apply(instance, args);
      return instance;
    }
  }();

var suites = {
  'create': function () {
    return applySecond(List, arguments)
  }
};

_ = require("underscore");

util = require("util");

suite("create");

test("1 item,5", function () {
  var result = suites.create.apply(null, ['1 item', [5]]);
  var pass = _.isEqual(result, {
    list: {
      next: {
        item: '1 item',
        previous: [Circular],
        next: {
          item: [5],
          previous: [Circular]
        }
      }
    }
  });
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "{ list: \n   { next: \n      { item: '1 item',\n        previous: [Circular],\n        next: { item: [ 5 ], previous: [Circular] } } } }" + "\n     Input:  ['1item',[5]]");
  }
});