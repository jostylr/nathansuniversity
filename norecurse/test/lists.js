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

    return list.itemsToArray([]);
  },
  'get': function (arr, n, tag) {
    var list = new List(arr, tag);

    return list.get(n, tag);
  }
};

_ = require("underscore");

util = require("util");

suite("List");

test("1", function () {
  var result = suites.List.apply(null, [
    [1]
  ]);
  var pass = _.isEqual(result, [1]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ 1 ]" + "\n     Input:  [[1]]");
  }
});

test("5,6", function () {
  var result = suites.List.apply(null, [
    [5, 6]
  ]);
  var pass = _.isEqual(result, [5, 6]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ 5, 6 ]" + "\n     Input:  [[5,6]]");
  }
});

test("[]", function () {
  var flag = true;
  try {
    suites.List.apply(null, []);
  }
  catch (e) {
    flag = false;
    if (!_.isEqual(e.toString(), 'TypeError: Cannot read property '
    0 ' of undefined')) {
      throw new Error("wrong error", e);
    }
  }
  if (flag) {
    throw new Error("failed to throw error");
  }
});

test("art,3,4,[object Object]", function () {
  var result = suites.List.apply(null, [
    ['art', [3, 4],
    {
      a: 4
    }]
  ]);
  var pass = _.isEqual(result, ['art', [3, 4],
  {
    a: 4
  }]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ 'art', [ 3, 4 ], { a: 4 } ]" + "\n     Input:  [['art',[3,4],{a:4}]]");
  }
});

suite("get");

test("4,3,1,2", function () {
  var result = suites.get.apply(null, [
    [4, 3, 1], 2]);
  var pass = _.isEqual(result, 3);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "3" + "\n     Input:  [[4,3,1],2]");
  }
});

test("4,3,1,3", function () {
  var result = suites.get.apply(null, [
    [4, 3, 1], 3]);
  var pass = _.isEqual(result, 1);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "1" + "\n     Input:  [[4,3,1],3]");
  }
});

test("4,3,1,4", function () {
  var result = suites.get.apply(null, [
    [4, 3, 1], 4]);
  var pass = _.isEqual(result, null);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "null" + "\n     Input:  [[4,3,1],4]");
  }
});

test("4,3,1,0", function () {
  var result = suites.get.apply(null, [
    [4, 3, 1], 0]);
  var pass = _.isEqual(result, 4);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "4" + "\n     Input:  [[4,3,1],0]");
  }
});