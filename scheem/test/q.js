/*globals module, require, console, exports*/

var _ = require('underscore');

var evalScheem = require('../evalScheem').evalScheem;

//set this to {debugS:#} for debugging, use {env: 'x'} for getting a return value of the env.
var suites = {
  add: function () {
    return evalScheem.apply(null, arguments);
  },
  sub: function () {
    return evalScheem.apply(null, arguments);
  },
  mult: function () {
    return evalScheem.apply(null, arguments);
  },
  div: function () {
    return evalScheem.apply(null, arguments);
  },
  pow: function () {
    return evalScheem.apply(null, arguments);
  },
  mod: function () {
    return evalScheem.apply(null, arguments);
  },
  quote: function () {
    return evalScheem.apply(null, arguments);
  },
  lambda: function () {
    return evalScheem.apply(null, arguments);
  },
  hash: function () {
    return evalScheem.apply(null, arguments);
  },
  ifel: function () {
    return evalScheem.apply(null, arguments);
  },
  def: function () {
    var t = {
      env: 'x'
    };
    return evalScheem.apply(t, arguments);
  },
  set: function () {
    return evalScheem.apply(null, arguments);
  },
  begin: function () {
    return evalScheem.apply(null, arguments);
  },
  let: function () {
    return evalScheem.apply(null, arguments);
  }
};

_ = require("underscore");

util = require("util");

suite("add");

test("zero", function () {
  var flag = true;
  try {
    suites.add.apply(null, [
      ['+']
    ]);
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
  var result = suites.add.apply(null, [
    ['+', 2]
  ]);
  var pass = _.isEqual(result, 2);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "2" + "\n     Input:  [['+',2]]");
  }
});

test("two", function () {
  var result = suites.add.apply(null, [
    ['+', 3, 4]
  ]);
  var pass = _.isEqual(result, 7);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "7" + "\n     Input:  [['+',3,4]]");
  }
});

test("three", function () {
  var result = suites.add.apply(null, [
    ['+', 3, 4, 5]
  ]);
  var pass = _.isEqual(result, 12);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "12" + "\n     Input:  [['+',3,4,5]]");
  }
});

test("four", function () {
  var result = suites.add.apply(null, [
    ['+', 3, 4, 5, 6]
  ]);
  var pass = _.isEqual(result, 18);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "18" + "\n     Input:  [['+',3,4,5,6]]");
  }
});

suite("sub");

test("zero", function () {
  var flag = true;
  try {
    suites.sub.apply(null, [
      ['-']
    ]);
  }
  catch (e) {
    flag = false;
    if (!_.isEqual(e.toString(), "insufficient arguments -")) {
      throw new Error("wrong error", e);
    }
  }
  if (flag) {
    throw new Error("failed to throw error");
  }
});

test("one", function () {
  var result = suites.sub.apply(null, [
    ['-', 2]
  ]);
  var pass = _.isEqual(result, -2);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "-2" + "\n     Input:  [['-',2]]");
  }
});

test("two", function () {
  var result = suites.sub.apply(null, [
    ['-', 3, 4]
  ]);
  var pass = _.isEqual(result, -1);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "-1" + "\n     Input:  [['-',3,4]]");
  }
});

test("three", function () {
  var result = suites.sub.apply(null, [
    ['-', 3, 4, 5]
  ]);
  var pass = _.isEqual(result, -6);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "-6" + "\n     Input:  [['-',3,4,5]]");
  }
});

test("four", function () {
  var result = suites.sub.apply(null, [
    ['-', 3, 4, 5, 6]
  ]);
  var pass = _.isEqual(result, -12);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "-12" + "\n     Input:  [['-',3,4,5,6]]");
  }
});

suite("mult");

test("zero", function () {
  var flag = true;
  try {
    suites.mult.apply(null, [
      ['*']
    ]);
  }
  catch (e) {
    flag = false;
    if (!_.isEqual(e.toString(), "insufficient arguments *")) {
      throw new Error("wrong error", e);
    }
  }
  if (flag) {
    throw new Error("failed to throw error");
  }
});

test("one", function () {
  var result = suites.mult.apply(null, [
    ['*', 2]
  ]);
  var pass = _.isEqual(result, 2);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "2" + "\n     Input:  [['*',2]]");
  }
});

test("two", function () {
  var result = suites.mult.apply(null, [
    ['*', 3, 4]
  ]);
  var pass = _.isEqual(result, 12);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "12" + "\n     Input:  [['*',3,4]]");
  }
});

test("three", function () {
  var result = suites.mult.apply(null, [
    ['*', 3, 4, 5]
  ]);
  var pass = _.isEqual(result, 60);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "60" + "\n     Input:  [['*',3,4,5]]");
  }
});

test("four", function () {
  var result = suites.mult.apply(null, [
    ['*', 3, 4, 5, 6]
  ]);
  var pass = _.isEqual(result, 360);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "360" + "\n     Input:  [['*',3,4,5,6]]");
  }
});

suite("div");

test("zero", function () {
  var flag = true;
  try {
    suites.div.apply(null, [
      ['/']
    ]);
  }
  catch (e) {
    flag = false;
    if (!_.isEqual(e.toString(), "insufficient arguments /")) {
      throw new Error("wrong error", e);
    }
  }
  if (flag) {
    throw new Error("failed to throw error");
  }
});

test("one", function () {
  var result = suites.div.apply(null, [
    ['/', 2]
  ]);
  var pass = _.isEqual(result, 0.5);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "0.5" + "\n     Input:  [['/',2]]");
  }
});

test("two", function () {
  var result = suites.div.apply(null, [
    ['/', 3, 4]
  ]);
  var pass = _.isEqual(result, 0.75);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "0.75" + "\n     Input:  [['/',3,4]]");
  }
});

test("three", function () {
  var result = suites.div.apply(null, [
    ['/', 3, 4, 5]
  ]);
  var pass = _.isEqual(result, 0.15);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "0.15" + "\n     Input:  [['/',3,4,5]]");
  }
});

test("four", function () {
  var result = suites.div.apply(null, [
    ['/', 3, 4, 5, 6]
  ]);
  var pass = _.isEqual(result, 0.024999999999999998);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "0.024999999999999998" + "\n     Input:  [['/',3,4,5,6]]");
  }
});

suite("mod");

test("zero", function () {
  var flag = true;
  try {
    suites.mod.apply(null, [
      ['%']
    ]);
  }
  catch (e) {
    flag = false;
    if (!_.isEqual(e.toString(), "insufficient arguments %")) {
      throw new Error("wrong error", e);
    }
  }
  if (flag) {
    throw new Error("failed to throw error");
  }
});

test("one", function () {
  var flag = true;
  try {
    suites.mod.apply(null, [
      ['%', 2]
    ]);
  }
  catch (e) {
    flag = false;
    if (!_.isEqual(e.toString(), "insufficient arguments %")) {
      throw new Error("wrong error", e);
    }
  }
  if (flag) {
    throw new Error("failed to throw error");
  }
});

test("two", function () {
  var result = suites.mod.apply(null, [
    ['%', 3, 4]
  ]);
  var pass = _.isEqual(result, 3);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "3" + "\n     Input:  [['%',3,4]]");
  }
});

test("three", function () {
  var flag = true;
  try {
    suites.mod.apply(null, [
      ['%', 3, 4, 5]
    ]);
  }
  catch (e) {
    flag = false;
    if (!_.isEqual(e.toString(), "too many arguments %")) {
      throw new Error("wrong error", e);
    }
  }
  if (flag) {
    throw new Error("failed to throw error");
  }
});

test("four", function () {
  var flag = true;
  try {
    suites.mod.apply(null, [
      ['%', 3, 4, 5, 6]
    ]);
  }
  catch (e) {
    flag = false;
    if (!_.isEqual(e.toString(), "too many arguments %")) {
      throw new Error("wrong error", e);
    }
  }
  if (flag) {
    throw new Error("failed to throw error");
  }
});

suite("pow");

test("zero", function () {
  var flag = true;
  try {
    suites.pow.apply(null, [
      ['^']
    ]);
  }
  catch (e) {
    flag = false;
    if (!_.isEqual(e.toString(), "insufficient arguments ^")) {
      throw new Error("wrong error", e);
    }
  }
  if (flag) {
    throw new Error("failed to throw error");
  }
});

test("one", function () {
  var flag = true;
  try {
    suites.pow.apply(null, [
      ['^', 2]
    ]);
  }
  catch (e) {
    flag = false;
    if (!_.isEqual(e.toString(), "insufficient arguments ^")) {
      throw new Error("wrong error", e);
    }
  }
  if (flag) {
    throw new Error("failed to throw error");
  }
});

test("two", function () {
  var result = suites.pow.apply(null, [
    ['^', 3, 4]
  ]);
  var pass = _.isEqual(result, 81);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "81" + "\n     Input:  [['^',3,4]]");
  }
});

test("three", function () {
  var flag = true;
  try {
    suites.pow.apply(null, [
      ['^', 3, 4, 5]
    ]);
  }
  catch (e) {
    flag = false;
    if (!_.isEqual(e.toString(), "too many arguments ^")) {
      throw new Error("wrong error", e);
    }
  }
  if (flag) {
    throw new Error("failed to throw error");
  }
});

test("four", function () {
  var flag = true;
  try {
    suites.pow.apply(null, [
      ['^', 3, 4, 5, 6]
    ]);
  }
  catch (e) {
    flag = false;
    if (!_.isEqual(e.toString(), "too many arguments ^")) {
      throw new Error("wrong error", e);
    }
  }
  if (flag) {
    throw new Error("failed to throw error");
  }
});

suite("quote");

test("an atom", function () {
  var result = suites.quote.apply(null, [
    ['quote', 'dog']
  ]);
  var pass = _.isEqual(result, 'dog');
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "'dog'" + "\n     Input:  [['quote','dog']]");
  }
});

test("a number", function () {
  var result = suites.quote.apply(null, [
    ['quote', 3]
  ]);
  var pass = _.isEqual(result, 3);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "3" + "\n     Input:  [['quote',3]]");
  }
});

test("a list", function () {
  var result = suites.quote.apply(null, [
    ['quote', [1, 2, 3]]
  ]);
  var pass = _.isEqual(result, [1, 2, 3]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ 1, 2, 3 ]" + "\n     Input:  [['quote',[1,2,3]]]");
  }
});

test("eval", function () {
  var result = suites.quote.apply(null, [
    ['quote', [1, 3, 'x', 4]]
  ]);
  var pass = _.isEqual(result, [1, 3, 'x', 4]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ 1, 3, 'x', 4 ]" + "\n     Input:  [['quote',[1,3,'x',4]]]");
  }
});

suite("lambda");

test("id", function () {
  var result = suites.lambda.apply(null, [
    [
      ['lambda', 'x', 'x'], 2]
  ]);
  var pass = _.isEqual(result, [2]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ 2 ]" + "\n     Input:  [[['lambda','x','x'],2]]");
  }
});

test("args", function () {
  var result = suites.lambda.apply(null, [
    [
      ['lambda', ['x', 'y'],
        ['+', 'x', 'y']
      ], 2, 3]
  ]);
  var pass = _.isEqual(result, [5]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ 5 ]" + "\n     Input:  [[['lambda',['x','y'],['+','x','y']],2,3]]");
  }
});

suite("ifel");

test("basic", function () {
  var result = suites.ifel.apply(null, [
    ['if', ['quote', '#t'], 3, 4]
  ]);
  var pass = _.isEqual(result, 3);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "3" + "\n     Input:  [['if',['quote','#t'],3,4]]");
  }
});

test("basic f", function () {
  var result = suites.ifel.apply(null, [
    ['if', ['quote', '#f'], 3, 4]
  ]);
  var pass = _.isEqual(result, 4);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "4" + "\n     Input:  [['if',['quote','#f'],3,4]]");
  }
});

suite("def");

test("simple", function () {
  var result = suites.def.apply(null, [
    ['define', 'x', 3]
  ]);
  var pass = _.isEqual(result, 3);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "3" + "\n     Input:  [['define','x',3]]");
  }
});

suite("begin");

test("simple", function () {
  var result = suites.begin.apply(null, [
    ['begin', ['define', 'x', 3], 'x']
  ]);
  var pass = _.isEqual(result, 3);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "3" + "\n     Input:  [['begin',['define','x',3],'x']]");
  }
});

test("multi", function () {
  var result = suites.begin.apply(null, [
    ['begin', ['define', 'x', 3, 'y', 4],
      ['+', 'x', 'y']
    ]
  ]);
  var pass = _.isEqual(result, 7);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "7" + "\n     Input:  [['begin',['define','x',3,'y',4],['+','x','y']]]");
  }
});

test("set", function () {
  var result = suites.begin.apply(null, [
    ['begin', ['define', 'x', 3, 'y', 4],
      ['set!', 'y', 3],
      ['+', 'x', 'y']
    ]
  ]);
  var pass = _.isEqual(result, 6);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "6" + "\n     Input:  [['begin',['define','x',3,'y',4],['set!','y',3],['+','x','y']]]");
  }
});

test("hash", function () {
  var result = suites.begin.apply(null, [
    ['begin', ['define', 'x', ['#', 'y', 5, 'z', 8]],
      ['+', ['.', 'x', ['quote', 'y']],
        ['.', 'x', ['quote', 'z']]
      ]
    ]
  ]);
  var pass = _.isEqual(result, 13);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "13" + "\n     Input:  [['begin',['define','x',['#','y',5,'z',8]],['+',['.','x',['quote','y']],['.','x',['quote','z']]]]]");
  }
});

suite("let");

test("sum", function () {
  var result = suites.let.apply(null, [
    ['let', 'x', 3, 'y', 5, ['+', 'x', 'y']]
  ]);
  var pass = _.isEqual(result, 8);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "8" + "\n     Input:  [['let','x',3,'y',5,['+','x','y']]]");
  }
});