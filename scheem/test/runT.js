/*globals module, require, console, exports*/

var _ = require('underscore');

var run = require('../run');

module.exports.run = function () {
  return run.apply(null, arguments);
};

console.log(run('(+ 3 4)'));

suites = {
  trial: function () {
    return run.apply(null, arguments);
  }
};

_ = require("underscore");

util = require("util");

suite("trial");

test("add", function () {
  var result = suites.trial.apply(null, ['(+ 3 4)']);
  var pass = _.isEqual(result, 7);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "7" + "\n     Input:  [ '(+ 3 4)' ]");
  }
});