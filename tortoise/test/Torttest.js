/*globals module, require, console, exports*/

var Turtle = require('../Tortoise');

var fs = require('fs');

var util = require('util');

var pegjs = require('pegjs');

var tort = pegjs.buildParser(fs.readFileSync("tort.peg", "utf8"));

var parser = tort.parse;

var evalTort = require('../evaltort');

var run = function (tags) {
    try {
      var turtle = new Turtle({
        div: "result",
        w: 400,
        h: 400
      });
      for (i = 0; i < tags.length; i += 1) {
        turtle.com(tags[i]);
      }
      turtle.ret();
    }
    catch (e) {
      if (this.debugF) {
        console.log(util.inspect(this.debugF.ret, false, 4));
      }
      throw e;
    }
  };

var integ = function () {
    try {
      var arr = parser.apply(this, arguments);
      var turtle = new Turtle({
        div: "result",
        w: 400,
        h: 400
      });
      evalTort.call(this, arr, turtle);
      turtle.ret();

    }
    catch (e) {
      if (this.debugF) {
        console.log(util.inspect(this.debugF.ret, false, 4));
      }
      throw e;
    }
  };

var suites = {
  'go': function () {
    return run.apply(null, arguments);
  }
};

_ = require("underscore");

util = require("util");

suite("go");

test("[]", function () {
  var result = suites.go.apply(null, []);
  var pass = _.isEqual(result, null);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "null" + "\n     Input:  []");
  }
});