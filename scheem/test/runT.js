/*globals module, require, console, exports*/

var _ = require('underscore');

var runT = require('../run');

var suites = {
  add: function () {
    return runT.apply(null, arguments);
  },
  arith: function () {
    return runT.apply(null, arguments);
  }
};

_ = require("underscore");

util = require("util");

suite("add");

test("zero", function () {
  var flag = true;
  try {
    suites.add.apply(null, ['(+)']);
  }
  catch (e) {
    flag = false;
    if (!_.isEqual(e.toString(), "insufficient arguments +")) {
      throw new Error("wrong error", e);
    }
  }
  if (flag) {
    throw new Error("failed to throw error");
  }
});

test("one", function () {
  var result = suites.add.apply(null, ['(+ 2)']);
  var pass = _.isEqual(result, 2);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "2" + "\n     Input:  ['(+2)']");
  }
});

test("two", function () {
  var result = suites.add.apply(null, ['(+ 3 4)']);
  var pass = _.isEqual(result, 7);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "7" + "\n     Input:  ['(+34)']");
  }
});

test("three", function () {
  var result = suites.add.apply(null, ['(+ 3 4 5)']);
  var pass = _.isEqual(result, 12);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "12" + "\n     Input:  ['(+345)']");
  }
});

test("four", function () {
  var result = suites.add.apply(null, ['(+ 3 4 5 6)']);
  var pass = _.isEqual(result, 18);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "18" + "\n     Input:  ['(+3456)']");
  }
});

suite("arith");

test("(- 3 4)", function () {
  var result = suites.arith.apply(null, ['(- 3 4)']);
  var pass = _.isEqual(result, -1);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "-1" + "\n     Input:  ['(-34)']");
  }
});

test("(* 5 6)", function () {
  var result = suites.arith.apply(null, ['(* 5 6)']);
  var pass = _.isEqual(result, 30);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "30" + "\n     Input:  ['(*56)']");
  }
});

test("(/ 8 4)", function () {
  var result = suites.arith.apply(null, ['(/ 8 4)']);
  var pass = _.isEqual(result, 2);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "2" + "\n     Input:  ['(/84)']");
  }
});

test("(^ 2 3)", function () {
  var result = suites.arith.apply(null, ['(^ 2 3)']);
  var pass = _.isEqual(result, 8);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "8" + "\n     Input:  ['(^23)']");
  }
});

test("(% 8 4)", function () {
  var result = suites.arith.apply(null, ['(% 8 4)']);
  var pass = _.isEqual(result, 0);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "0" + "\n     Input:  ['(%84)']");
  }
});

test("(% 3 4)", function () {
  var result = suites.arith.apply(null, ['(% 3 4)']);
  var pass = _.isEqual(result, 3);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "3" + "\n     Input:  ['(%34)']");
  }
});