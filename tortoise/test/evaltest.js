/*globals module, require, console, exports*/

var fs = require('fs');

var util = require('util');

var pegjs = require('pegjs');

var tort = pegjs.buildParser(fs.readFileSync("tort.peg", "utf8"));

var parser = tort.parse;

var evalTort = require('../evaltort');

var run = function () {
    try {
      var arr = parser.apply(this, arguments);
      return evalTort.call(this, arr);
    }
    catch (e) {
      if (this.debugF) {
        console.log(util.inspect(this.debugF.ret, false, 4));
      }
      throw e;
    }
  };

var suites = {
  'add': function () {
    return run.apply(null, arguments);
  },
  'arith': function () {
    return run.apply(null, arguments);
  },
  'stat': function () {
    return run.apply(null, arguments);
  },
  'if': function () {
    return run.apply(null, arguments);
  },
  'var': function () {
    return run.apply(null, arguments);
  },
  'repeat': function () {
    return run.apply({
      //debugF: 1,
      // maxtimes: 100
    }, arguments);
  },
  'fun': function () {
    return run.apply(null, arguments);
  }
};

_ = require("underscore");

util = require("util");

suite("add");

test("3 +2;", function () {
  var result = suites.add.apply(null, ['3 +2;']);
  var pass = _.isEqual(result, 5);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "5" + "\n     Input:  ['3+2;']");
  }
});

test("3 +2 - 5;", function () {
  var result = suites.add.apply(null, ['3 +2 - 5;']);
  var pass = _.isEqual(result, 0);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "0" + "\n     Input:  ['3+2-5;']");
  }
});

suite("arith");

test("3*4 +2;", function () {
  var result = suites.arith.apply(null, ['3*4 +2;']);
  var pass = _.isEqual(result, 14);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "14" + "\n     Input:  ['3*4+2;']");
  }
});

test("3 < 2;", function () {
  var result = suites.arith.apply(null, ['3 < 2;']);
  var pass = _.isEqual(result, false);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "false" + "\n     Input:  ['3<2;']");
  }
});

test("3 < 2 + 5;", function () {
  var result = suites.arith.apply(null, ['3 < 2 + 5;']);
  var pass = _.isEqual(result, true);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "true" + "\n     Input:  ['3<2+5;']");
  }
});

test("3 * 2 < 2 + 5;", function () {
  var result = suites.arith.apply(null, ['3 * 2 < 2 + 5;']);
  var pass = _.isEqual(result, true);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "true" + "\n     Input:  ['3*2<2+5;']");
  }
});

test("-3 * 2 < 2 - 5;", function () {
  var result = suites.arith.apply(null, ['-3 * 2 < 2 - 5;']);
  var pass = _.isEqual(result, true);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "true" + "\n     Input:  ['-3*2<2-5;']");
  }
});

test("-3 * 2 < 2 - -5;", function () {
  var result = suites.arith.apply(null, ['-3 * 2 < 2 - -5;']);
  var pass = _.isEqual(result, true);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "true" + "\n     Input:  ['-3*2<2--5;']");
  }
});

test("-3 * 2 < 2 - - -5;", function () {
  var flag = true;
  try {
    suites.arith.apply(null, ['-3 * 2 < 2 - - -5;']);
  }
  catch (e) {
    flag = false;
    if (!_.isEqual(e.toString(), 'SyntaxError: [0-9]')) {
      throw new Error("wrong error", e);
    }
  }
  if (flag) {
    throw new Error("failed to throw error");
  }
});

suite("stat");

test("repeat (30) { 2 + 2; }", function () {
  var result = suites.stat.apply(null, ['repeat (30) { 2 + 2; }']);
  var pass = _.isEqual(result, 4);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "4" + "\n     Input:  ['repeat(30){2+2;}']");
  }
});

test("f(5);", function () {
  var flag = true;
  try {
    suites.stat.apply(null, ['f(5);']);
  }
  catch (e) {
    flag = false;
    if (!_.isEqual(e.toString(), 'Lookup: no such var f')) {
      throw new Error("wrong error", e);
    }
  }
  if (flag) {
    throw new Error("failed to throw error");
  }
});

test("var size;", function () {
  var result = suites.stat.apply(null, ['var size;']);
  var pass = _.isEqual(result, undefined);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "undefined" + "\n     Input:  ['varsize;']");
  }
});

test("size := 5;", function () {
  var flag = true;
  try {
    suites.stat.apply(null, ['size := 5;']);
  }
  catch (e) {
    flag = false;
    if (!_.isEqual(e.toString(), 'Assignment: no such var size')) {
      throw new Error("wrong error", e);
    }
  }
  if (flag) {
    throw new Error("failed to throw error");
  }
});

test("f();", function () {
  var flag = true;
  try {
    suites.stat.apply(null, ['f();']);
  }
  catch (e) {
    flag = false;
    if (!_.isEqual(e.toString(), 'Lookup: no such var f')) {
      throw new Error("wrong error", e);
    }
  }
  if (flag) {
    throw new Error("failed to throw error");
  }
});

test("f(3, g(1));", function () {
  var flag = true;
  try {
    suites.stat.apply(null, ['f(3, g(1));']);
  }
  catch (e) {
    flag = false;
    if (!_.isEqual(e.toString(), 'Lookup: no such var f')) {
      throw new Error("wrong error", e);
    }
  }
  if (flag) {
    throw new Error("failed to throw error");
  }
});

suite("if");

test("if(3<4){2+3;}", function () {
  var result = suites.
  if .apply(null, ['if(3<4){2+3;}']);
  var pass = _.isEqual(result, 5);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "5" + "\n     Input:  ['if(3<4){2+3;}']");
  }
});

test("if(3>4){2+3;}", function () {
  var result = suites.
  if .apply(null, ['if(3>4){2+3;}']);
  var pass = _.isEqual(result, undefined);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "undefined" + "\n     Input:  ['if(3>4){2+3;}']");
  }
});

suite("var");

test("var test; test := 5 +3; test;", function () {
  var result = suites.
  var.apply(null, ['var test; test := 5 +3; test;']);
  var pass = _.isEqual(result, 8);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "8" + "\n     Input:  ['vartest;test:=5+3;test;']");
  }
});

suite("repeat");

test("var x; repeat(10) { x := x+1; } x;", function () {
  var result = suites.repeat.apply(null, ['var x; repeat(10) { x := x+1; } x;']);
  var pass = _.isEqual(result, 10);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "10" + "\n     Input:  ['varx;repeat(10){x:=x+1;}x;']");
  }
});

suite("fun");

test("define id (x) {x;} id(3);", function () {
  var result = suites.fun.apply(null, ['define id (x) {x;} id(3);']);
  var pass = _.isEqual(result, 3);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "3" + "\n     Input:  ['defineid(x){x;}id(3);']");
  }
});

test("define f (n) {n + 5;} f(3);", function () {
  var result = suites.fun.apply(null, ['define f (n) {n + 5;} f(3);']);
  var pass = _.isEqual(result, 8);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "8" + "\n     Input:  ['definef(n){n+5;}f(3);']");
  }
});

test("define fac (n) {if (n <= 1) {1;} if (n> 1) {n*fac(n-1);}} fac(3);", function () {
  var result = suites.fun.apply(null, ['define fac (n) {if (n <= 1) {1;} if (n> 1) {n*fac(n-1);}} fac(3);']);
  var pass = _.isEqual(result, 6);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "6" + "\n     Input:  ['definefac(n){if(n<=1){1;}if(n>1){n*fac(n-1);}}fac(3);']");
  }
});

test("define f (x, y) {x;} f(3, 4);", function () {
  var result = suites.fun.apply(null, ['define f (x, y) {x;} f(3, 4);']);
  var pass = _.isEqual(result, 3);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "3" + "\n     Input:  ['definef(x,y){x;}f(3,4);']");
  }
});