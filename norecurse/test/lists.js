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
  'List': function () {
    var list = applySecond(List, arguments)
    return list.toArray();
  }
};

_ = require("underscore");

util = require("util");

suite("List");

test("1", function () {
  var result = suites.List.apply(null, [1]);
  var pass = _.isEqual(result, [1]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ 1 ]" + "\n     Input:  [1]");
  }
});

test("5,6", function () {
  var result = suites.List.apply(null, [5, 6]);
  var pass = _.isEqual(result, [5, 6]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ 5, 6 ]" + "\n     Input:  [5,6]");
  }
});

test("[]", function () {
  var result = suites.List.apply(null, []);
  var pass = _.isEqual(result, [undefined]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ undefined ]" + "\n     Input:  []");
  }
});

test("art,3,4,[object Object]", function () {
  var result = suites.List.apply(null, ['art', [3, 4],
  {
    a: 4
  }]);
  var pass = _.isEqual(result, ['art', [3, 4],
  {
    a: 4
  }]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ 'art', [ 3, 4 ], { a: 4 } ]" + "\n     Input:  ['art',[3,4],{a:4}]");
  }
});