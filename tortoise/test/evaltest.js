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
  },
  'ext': function () {
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

test("repeat(2) {right(20);repeat(3) {forward(20);right(10);}}", function () {
  var result = suites.stat.apply(null, ['repeat(2) {right(20);repeat(3) {forward(20);right(10);}}']);
  var pass = _.isEqual(result, [{
    tag: 'angle',
    a: 70,
    oa: 90
  }, {
    tag: 'position',
    x: 7,
    y: 19,
    ox: 0,
    oy: 0
  }, {
    tag: 'angle',
    a: 60,
    oa: 70
  }, {
    tag: 'position',
    x: 17,
    y: 36,
    ox: 7,
    oy: 19
  }, {
    tag: 'angle',
    a: 50,
    oa: 60
  }, {
    tag: 'position',
    x: 30,
    y: 51,
    ox: 17,
    oy: 36
  }, {
    tag: 'angle',
    a: 40,
    oa: 50
  }, {
    tag: 'angle',
    a: 20,
    oa: 40
  }, {
    tag: 'position',
    x: 49,
    y: 58,
    ox: 30,
    oy: 51
  }, {
    tag: 'angle',
    a: 10,
    oa: 20
  }, {
    tag: 'position',
    x: 69,
    y: 61,
    ox: 49,
    oy: 58
  }, {
    tag: 'angle',
    a: 0,
    oa: 10
  }, {
    tag: 'position',
    x: 89,
    y: 61,
    ox: 69,
    oy: 61
  }, {
    tag: 'angle',
    a: -10,
    oa: 0
  }]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ { tag: 'angle', a: 70, oa: 90 },\n  { tag: 'position', x: 7, y: 19, ox: 0, oy: 0 },\n  { tag: 'angle', a: 60, oa: 70 },\n  { tag: 'position', x: 17, y: 36, ox: 7, oy: 19 },\n  { tag: 'angle', a: 50, oa: 60 },\n  { tag: 'position', x: 30, y: 51, ox: 17, oy: 36 },\n  { tag: 'angle', a: 40, oa: 50 },\n  { tag: 'angle', a: 20, oa: 40 },\n  { tag: 'position', x: 49, y: 58, ox: 30, oy: 51 },\n  { tag: 'angle', a: 10, oa: 20 },\n  { tag: 'position', x: 69, y: 61, ox: 49, oy: 58 },\n  { tag: 'angle', a: 0, oa: 10 },\n  { tag: 'position', x: 89, y: 61, ox: 69, oy: 61 },\n  { tag: 'angle', a: -10, oa: 0 } ]" + "\n     Input:  ['repeat(2){right(20);repeat(3){forward(20);right(10);}}']");
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

test("define spiral(size) {    if (size < 30) {        forward(size);        right(15);        var newsize;        newsize := size * 1.02;        spiral(newsize);    }}spiral(5);", function () {
  var result = suites.stat.apply(null, ['define spiral(size) {    if (size < 30) {        forward(size);        right(15);        var newsize;        newsize := size * 1.02;        spiral(newsize);    }}spiral(5);']);
  var pass = _.isEqual(result, [{
    tag: 'position',
    x: 0,
    y: 5,
    ox: 0,
    oy: 0
  }, {
    tag: 'angle',
    a: 75,
    oa: 90
  }, {
    tag: 'position',
    x: 1,
    y: 10,
    ox: 0,
    oy: 5
  }, {
    tag: 'angle',
    a: 60,
    oa: 75
  }, {
    tag: 'position',
    x: 4,
    y: 15,
    ox: 1,
    oy: 10
  }, {
    tag: 'angle',
    a: 45,
    oa: 60
  }, {
    tag: 'position',
    x: 8,
    y: 19,
    ox: 4,
    oy: 15
  }, {
    tag: 'angle',
    a: 30,
    oa: 45
  }, {
    tag: 'position',
    x: 13,
    y: 22,
    ox: 8,
    oy: 19
  }, {
    tag: 'angle',
    a: 15,
    oa: 30
  }, {
    tag: 'position',
    x: 18,
    y: 23,
    ox: 13,
    oy: 22
  }, {
    tag: 'angle',
    a: 0,
    oa: 15
  }, {
    tag: 'position',
    x: 24,
    y: 23,
    ox: 18,
    oy: 23
  }, {
    tag: 'angle',
    a: -15,
    oa: 0
  }, {
    tag: 'position',
    x: 30,
    y: 22,
    ox: 24,
    oy: 23
  }, {
    tag: 'angle',
    a: -30,
    oa: -15
  }, {
    tag: 'position',
    x: 35,
    y: 19,
    ox: 30,
    oy: 22
  }, {
    tag: 'angle',
    a: -45,
    oa: -30
  }, {
    tag: 'position',
    x: 39,
    y: 15,
    ox: 35,
    oy: 19
  }, {
    tag: 'angle',
    a: -60,
    oa: -45
  }, {
    tag: 'position',
    x: 42,
    y: 10,
    ox: 39,
    oy: 15
  }, {
    tag: 'angle',
    a: -75,
    oa: -60
  }, {
    tag: 'position',
    x: 44,
    y: 4,
    ox: 42,
    oy: 10
  }, {
    tag: 'angle',
    a: -90,
    oa: -75
  }, {
    tag: 'position',
    x: 44,
    y: -2,
    ox: 44,
    oy: 4
  }, {
    tag: 'angle',
    a: -105,
    oa: -90
  }, {
    tag: 'position',
    x: 42,
    y: -8,
    ox: 44,
    oy: -2
  }, {
    tag: 'angle',
    a: -120,
    oa: -105
  }, {
    tag: 'position',
    x: 39,
    y: -14,
    ox: 42,
    oy: -8
  }, {
    tag: 'angle',
    a: -135,
    oa: -120
  }, {
    tag: 'position',
    x: 34,
    y: -19,
    ox: 39,
    oy: -14
  }, {
    tag: 'angle',
    a: -150,
    oa: -135
  }, {
    tag: 'position',
    x: 28,
    y: -22,
    ox: 34,
    oy: -19
  }, {
    tag: 'angle',
    a: -165,
    oa: -150
  }, {
    tag: 'position',
    x: 21,
    y: -24,
    ox: 28,
    oy: -22
  }, {
    tag: 'angle',
    a: -180,
    oa: -165
  }, {
    tag: 'position',
    x: 14,
    y: -24,
    ox: 21,
    oy: -24
  }, {
    tag: 'angle',
    a: -195,
    oa: -180
  }, {
    tag: 'position',
    x: 7,
    y: -22,
    ox: 14,
    oy: -24
  }, {
    tag: 'angle',
    a: -210,
    oa: -195
  }, {
    tag: 'position',
    x: 1,
    y: -18,
    ox: 7,
    oy: -22
  }, {
    tag: 'angle',
    a: -225,
    oa: -210
  }, {
    tag: 'position',
    x: -4,
    y: -13,
    ox: 1,
    oy: -18
  }, {
    tag: 'angle',
    a: -240,
    oa: -225
  }, {
    tag: 'position',
    x: -8,
    y: -6,
    ox: -4,
    oy: -13
  }, {
    tag: 'angle',
    a: -255,
    oa: -240
  }, {
    tag: 'position',
    x: -10,
    y: 2,
    ox: -8,
    oy: -6
  }, {
    tag: 'angle',
    a: -270,
    oa: -255
  }, {
    tag: 'position',
    x: -10,
    y: 10,
    ox: -10,
    oy: 2
  }, {
    tag: 'angle',
    a: -285,
    oa: -270
  }, {
    tag: 'position',
    x: -8,
    y: 18,
    ox: -10,
    oy: 10
  }, {
    tag: 'angle',
    a: -300,
    oa: -285
  }, {
    tag: 'position',
    x: -4,
    y: 25,
    ox: -8,
    oy: 18
  }, {
    tag: 'angle',
    a: -315,
    oa: -300
  }, {
    tag: 'position',
    x: 2,
    y: 31,
    ox: -4,
    oy: 25
  }, {
    tag: 'angle',
    a: -330,
    oa: -315
  }, {
    tag: 'position',
    x: 10,
    y: 35,
    ox: 2,
    oy: 31
  }, {
    tag: 'angle',
    a: -345,
    oa: -330
  }, {
    tag: 'position',
    x: 19,
    y: 37,
    ox: 10,
    oy: 35
  }, {
    tag: 'angle',
    a: -360,
    oa: -345
  }, {
    tag: 'position',
    x: 28,
    y: 37,
    ox: 19,
    oy: 37
  }, {
    tag: 'angle',
    a: -375,
    oa: -360
  }, {
    tag: 'position',
    x: 37,
    y: 35,
    ox: 28,
    oy: 37
  }, {
    tag: 'angle',
    a: -390,
    oa: -375
  }, {
    tag: 'position',
    x: 45,
    y: 30,
    ox: 37,
    oy: 35
  }, {
    tag: 'angle',
    a: -405,
    oa: -390
  }, {
    tag: 'position',
    x: 52,
    y: 23,
    ox: 45,
    oy: 30
  }, {
    tag: 'angle',
    a: -420,
    oa: -405
  }, {
    tag: 'position',
    x: 57,
    y: 15,
    ox: 52,
    oy: 23
  }, {
    tag: 'angle',
    a: -435,
    oa: -420
  }, {
    tag: 'position',
    x: 60,
    y: 5,
    ox: 57,
    oy: 15
  }, {
    tag: 'angle',
    a: -450,
    oa: -435
  }, {
    tag: 'position',
    x: 60,
    y: -5,
    ox: 60,
    oy: 5
  }, {
    tag: 'angle',
    a: -465,
    oa: -450
  }, {
    tag: 'position',
    x: 57,
    y: -15,
    ox: 60,
    oy: -5
  }, {
    tag: 'angle',
    a: -480,
    oa: -465
  }, {
    tag: 'position',
    x: 52,
    y: -24,
    ox: 57,
    oy: -15
  }, {
    tag: 'angle',
    a: -495,
    oa: -480
  }, {
    tag: 'position',
    x: 44,
    y: -32,
    ox: 52,
    oy: -24
  }, {
    tag: 'angle',
    a: -510,
    oa: -495
  }, {
    tag: 'position',
    x: 34,
    y: -38,
    ox: 44,
    oy: -32
  }, {
    tag: 'angle',
    a: -525,
    oa: -510
  }, {
    tag: 'position',
    x: 23,
    y: -41,
    ox: 34,
    oy: -38
  }, {
    tag: 'angle',
    a: -540,
    oa: -525
  }, {
    tag: 'position',
    x: 12,
    y: -41,
    ox: 23,
    oy: -41
  }, {
    tag: 'angle',
    a: -555,
    oa: -540
  }, {
    tag: 'position',
    x: 1,
    y: -38,
    ox: 12,
    oy: -41
  }, {
    tag: 'angle',
    a: -570,
    oa: -555
  }, {
    tag: 'position',
    x: -9,
    y: -32,
    ox: 1,
    oy: -38
  }, {
    tag: 'angle',
    a: -585,
    oa: -570
  }, {
    tag: 'position',
    x: -18,
    y: -23,
    ox: -9,
    oy: -32
  }, {
    tag: 'angle',
    a: -600,
    oa: -585
  }, {
    tag: 'position',
    x: -24,
    y: -12,
    ox: -18,
    oy: -23
  }, {
    tag: 'angle',
    a: -615,
    oa: -600
  }, {
    tag: 'position',
    x: -27,
    y: 0,
    ox: -24,
    oy: -12
  }, {
    tag: 'angle',
    a: -630,
    oa: -615
  }, {
    tag: 'position',
    x: -27,
    y: 13,
    ox: -27,
    oy: 0
  }, {
    tag: 'angle',
    a: -645,
    oa: -630
  }, {
    tag: 'position',
    x: -24,
    y: 26,
    ox: -27,
    oy: 13
  }, {
    tag: 'angle',
    a: -660,
    oa: -645
  }, {
    tag: 'position',
    x: -17,
    y: 38,
    ox: -24,
    oy: 26
  }, {
    tag: 'angle',
    a: -675,
    oa: -660
  }, {
    tag: 'position',
    x: -7,
    y: 48,
    ox: -17,
    oy: 38
  }, {
    tag: 'angle',
    a: -690,
    oa: -675
  }, {
    tag: 'position',
    x: 5,
    y: 55,
    ox: -7,
    oy: 48
  }, {
    tag: 'angle',
    a: -705,
    oa: -690
  }, {
    tag: 'position',
    x: 19,
    y: 59,
    ox: 5,
    oy: 55
  }, {
    tag: 'angle',
    a: -720,
    oa: -705
  }, {
    tag: 'position',
    x: 34,
    y: 59,
    ox: 19,
    oy: 59
  }, {
    tag: 'angle',
    a: -735,
    oa: -720
  }, {
    tag: 'position',
    x: 48,
    y: 55,
    ox: 34,
    oy: 59
  }, {
    tag: 'angle',
    a: -750,
    oa: -735
  }, {
    tag: 'position',
    x: 61,
    y: 47,
    ox: 48,
    oy: 55
  }, {
    tag: 'angle',
    a: -765,
    oa: -750
  }, {
    tag: 'position',
    x: 72,
    y: 36,
    ox: 61,
    oy: 47
  }, {
    tag: 'angle',
    a: -780,
    oa: -765
  }, {
    tag: 'position',
    x: 80,
    y: 22,
    ox: 72,
    oy: 36
  }, {
    tag: 'angle',
    a: -795,
    oa: -780
  }, {
    tag: 'position',
    x: 84,
    y: 6,
    ox: 80,
    oy: 22
  }, {
    tag: 'angle',
    a: -810,
    oa: -795
  }, {
    tag: 'position',
    x: 84,
    y: -10,
    ox: 84,
    oy: 6
  }, {
    tag: 'angle',
    a: -825,
    oa: -810
  }, {
    tag: 'position',
    x: 80,
    y: -26,
    ox: 84,
    oy: -10
  }, {
    tag: 'angle',
    a: -840,
    oa: -825
  }, {
    tag: 'position',
    x: 71,
    y: -41,
    ox: 80,
    oy: -26
  }, {
    tag: 'angle',
    a: -855,
    oa: -840
  }, {
    tag: 'position',
    x: 59,
    y: -53,
    ox: 71,
    oy: -41
  }, {
    tag: 'angle',
    a: -870,
    oa: -855
  }, {
    tag: 'position',
    x: 44,
    y: -62,
    ox: 59,
    oy: -53
  }, {
    tag: 'angle',
    a: -885,
    oa: -870
  }, {
    tag: 'position',
    x: 27,
    y: -67,
    ox: 44,
    oy: -62
  }, {
    tag: 'angle',
    a: -900,
    oa: -885
  }, {
    tag: 'position',
    x: 9,
    y: -67,
    ox: 27,
    oy: -67
  }, {
    tag: 'angle',
    a: -915,
    oa: -900
  }, {
    tag: 'position',
    x: -9,
    y: -62,
    ox: 9,
    oy: -67
  }, {
    tag: 'angle',
    a: -930,
    oa: -915
  }, {
    tag: 'position',
    x: -26,
    y: -52,
    ox: -9,
    oy: -62
  }, {
    tag: 'angle',
    a: -945,
    oa: -930
  }, {
    tag: 'position',
    x: -40,
    y: -38,
    ox: -26,
    oy: -52
  }, {
    tag: 'angle',
    a: -960,
    oa: -945
  }, {
    tag: 'position',
    x: -50,
    y: -21,
    ox: -40,
    oy: -38
  }, {
    tag: 'angle',
    a: -975,
    oa: -960
  }, {
    tag: 'position',
    x: -55,
    y: -1,
    ox: -50,
    oy: -21
  }, {
    tag: 'angle',
    a: -990,
    oa: -975
  }, {
    tag: 'position',
    x: -55,
    y: 20,
    ox: -55,
    oy: -1
  }, {
    tag: 'angle',
    a: -1005,
    oa: -990
  }, {
    tag: 'position',
    x: -50,
    y: 40,
    ox: -55,
    oy: 20
  }, {
    tag: 'angle',
    a: -1020,
    oa: -1005
  }, {
    tag: 'position',
    x: -39,
    y: 59,
    ox: -50,
    oy: 40
  }, {
    tag: 'angle',
    a: -1035,
    oa: -1020
  }, {
    tag: 'position',
    x: -23,
    y: 75,
    ox: -39,
    oy: 59
  }, {
    tag: 'angle',
    a: -1050,
    oa: -1035
  }, {
    tag: 'position',
    x: -3,
    y: 86,
    ox: -23,
    oy: 75
  }, {
    tag: 'angle',
    a: -1065,
    oa: -1050
  }, {
    tag: 'position',
    x: 19,
    y: 92,
    ox: -3,
    oy: 86
  }, {
    tag: 'angle',
    a: -1080,
    oa: -1065
  }, {
    tag: 'position',
    x: 42,
    y: 92,
    ox: 19,
    oy: 92
  }, {
    tag: 'angle',
    a: -1095,
    oa: -1080
  }, {
    tag: 'position',
    x: 65,
    y: 86,
    ox: 42,
    oy: 92
  }, {
    tag: 'angle',
    a: -1110,
    oa: -1095
  }, {
    tag: 'position',
    x: 86,
    y: 74,
    ox: 65,
    oy: 86
  }, {
    tag: 'angle',
    a: -1125,
    oa: -1110
  }, {
    tag: 'position',
    x: 104,
    y: 56,
    ox: 86,
    oy: 74
  }, {
    tag: 'angle',
    a: -1140,
    oa: -1125
  }, {
    tag: 'position',
    x: 117,
    y: 34,
    ox: 104,
    oy: 56
  }, {
    tag: 'angle',
    a: -1155,
    oa: -1140
  }, {
    tag: 'position',
    x: 124,
    y: 9,
    ox: 117,
    oy: 34
  }, {
    tag: 'angle',
    a: -1170,
    oa: -1155
  }, {
    tag: 'position',
    x: 124,
    y: -17,
    ox: 124,
    oy: 9
  }, {
    tag: 'angle',
    a: -1185,
    oa: -1170
  }, {
    tag: 'position',
    x: 117,
    y: -43,
    ox: 124,
    oy: -17
  }, {
    tag: 'angle',
    a: -1200,
    oa: -1185
  }, {
    tag: 'position',
    x: 103,
    y: -67,
    ox: 117,
    oy: -43
  }, {
    tag: 'angle',
    a: -1215,
    oa: -1200
  }, {
    tag: 'position',
    x: 83,
    y: -87,
    ox: 103,
    oy: -67
  }, {
    tag: 'angle',
    a: -1230,
    oa: -1215
  }, {
    tag: 'position',
    x: 58,
    y: -101,
    ox: 83,
    oy: -87
  }, {
    tag: 'angle',
    a: -1245,
    oa: -1230
  }, {
    tag: 'position',
    x: 30,
    y: -109,
    ox: 58,
    oy: -101
  }, {
    tag: 'angle',
    a: -1260,
    oa: -1245
  }, {
    tag: 'position',
    x: 0,
    y: -109,
    ox: 30,
    oy: -109
  }, {
    tag: 'angle',
    a: -1275,
    oa: -1260
  }]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ { tag: 'position', x: 0, y: 5, ox: 0, oy: 0 },\n  { tag: 'angle', a: 75, oa: 90 },\n  { tag: 'position', x: 1, y: 10, ox: 0, oy: 5 },\n  { tag: 'angle', a: 60, oa: 75 },\n  { tag: 'position', x: 4, y: 15, ox: 1, oy: 10 },\n  { tag: 'angle', a: 45, oa: 60 },\n  { tag: 'position', x: 8, y: 19, ox: 4, oy: 15 },\n  { tag: 'angle', a: 30, oa: 45 },\n  { tag: 'position', x: 13, y: 22, ox: 8, oy: 19 },\n  { tag: 'angle', a: 15, oa: 30 },\n  { tag: 'position', x: 18, y: 23, ox: 13, oy: 22 },\n  { tag: 'angle', a: 0, oa: 15 },\n  { tag: 'position', x: 24, y: 23, ox: 18, oy: 23 },\n  { tag: 'angle', a: -15, oa: 0 },\n  { tag: 'position', x: 30, y: 22, ox: 24, oy: 23 },\n  { tag: 'angle', a: -30, oa: -15 },\n  { tag: 'position', x: 35, y: 19, ox: 30, oy: 22 },\n  { tag: 'angle', a: -45, oa: -30 },\n  { tag: 'position', x: 39, y: 15, ox: 35, oy: 19 },\n  { tag: 'angle', a: -60, oa: -45 },\n  { tag: 'position', x: 42, y: 10, ox: 39, oy: 15 },\n  { tag: 'angle', a: -75, oa: -60 },\n  { tag: 'position', x: 44, y: 4, ox: 42, oy: 10 },\n  { tag: 'angle', a: -90, oa: -75 },\n  { tag: 'position', x: 44, y: -2, ox: 44, oy: 4 },\n  { tag: 'angle', a: -105, oa: -90 },\n  { tag: 'position', x: 42, y: -8, ox: 44, oy: -2 },\n  { tag: 'angle', a: -120, oa: -105 },\n  { tag: 'position', x: 39, y: -14, ox: 42, oy: -8 },\n  { tag: 'angle', a: -135, oa: -120 },\n  { tag: 'position', x: 34, y: -19, ox: 39, oy: -14 },\n  { tag: 'angle', a: -150, oa: -135 },\n  { tag: 'position', x: 28, y: -22, ox: 34, oy: -19 },\n  { tag: 'angle', a: -165, oa: -150 },\n  { tag: 'position', x: 21, y: -24, ox: 28, oy: -22 },\n  { tag: 'angle', a: -180, oa: -165 },\n  { tag: 'position', x: 14, y: -24, ox: 21, oy: -24 },\n  { tag: 'angle', a: -195, oa: -180 },\n  { tag: 'position', x: 7, y: -22, ox: 14, oy: -24 },\n  { tag: 'angle', a: -210, oa: -195 },\n  { tag: 'position', x: 1, y: -18, ox: 7, oy: -22 },\n  { tag: 'angle', a: -225, oa: -210 },\n  { tag: 'position', x: -4, y: -13, ox: 1, oy: -18 },\n  { tag: 'angle', a: -240, oa: -225 },\n  { tag: 'position', x: -8, y: -6, ox: -4, oy: -13 },\n  { tag: 'angle', a: -255, oa: -240 },\n  { tag: 'position', x: -10, y: 2, ox: -8, oy: -6 },\n  { tag: 'angle', a: -270, oa: -255 },\n  { tag: 'position', x: -10, y: 10, ox: -10, oy: 2 },\n  { tag: 'angle', a: -285, oa: -270 },\n  { tag: 'position', x: -8, y: 18, ox: -10, oy: 10 },\n  { tag: 'angle', a: -300, oa: -285 },\n  { tag: 'position', x: -4, y: 25, ox: -8, oy: 18 },\n  { tag: 'angle', a: -315, oa: -300 },\n  { tag: 'position', x: 2, y: 31, ox: -4, oy: 25 },\n  { tag: 'angle', a: -330, oa: -315 },\n  { tag: 'position', x: 10, y: 35, ox: 2, oy: 31 },\n  { tag: 'angle', a: -345, oa: -330 },\n  { tag: 'position', x: 19, y: 37, ox: 10, oy: 35 },\n  { tag: 'angle', a: -360, oa: -345 },\n  { tag: 'position', x: 28, y: 37, ox: 19, oy: 37 },\n  { tag: 'angle', a: -375, oa: -360 },\n  { tag: 'position', x: 37, y: 35, ox: 28, oy: 37 },\n  { tag: 'angle', a: -390, oa: -375 },\n  { tag: 'position', x: 45, y: 30, ox: 37, oy: 35 },\n  { tag: 'angle', a: -405, oa: -390 },\n  { tag: 'position', x: 52, y: 23, ox: 45, oy: 30 },\n  { tag: 'angle', a: -420, oa: -405 },\n  { tag: 'position', x: 57, y: 15, ox: 52, oy: 23 },\n  { tag: 'angle', a: -435, oa: -420 },\n  { tag: 'position', x: 60, y: 5, ox: 57, oy: 15 },\n  { tag: 'angle', a: -450, oa: -435 },\n  { tag: 'position', x: 60, y: -5, ox: 60, oy: 5 },\n  { tag: 'angle', a: -465, oa: -450 },\n  { tag: 'position', x: 57, y: -15, ox: 60, oy: -5 },\n  { tag: 'angle', a: -480, oa: -465 },\n  { tag: 'position', x: 52, y: -24, ox: 57, oy: -15 },\n  { tag: 'angle', a: -495, oa: -480 },\n  { tag: 'position', x: 44, y: -32, ox: 52, oy: -24 },\n  { tag: 'angle', a: -510, oa: -495 },\n  { tag: 'position', x: 34, y: -38, ox: 44, oy: -32 },\n  { tag: 'angle', a: -525, oa: -510 },\n  { tag: 'position', x: 23, y: -41, ox: 34, oy: -38 },\n  { tag: 'angle', a: -540, oa: -525 },\n  { tag: 'position', x: 12, y: -41, ox: 23, oy: -41 },\n  { tag: 'angle', a: -555, oa: -540 },\n  { tag: 'position', x: 1, y: -38, ox: 12, oy: -41 },\n  { tag: 'angle', a: -570, oa: -555 },\n  { tag: 'position', x: -9, y: -32, ox: 1, oy: -38 },\n  { tag: 'angle', a: -585, oa: -570 },\n  { tag: 'position', x: -18, y: -23, ox: -9, oy: -32 },\n  { tag: 'angle', a: -600, oa: -585 },\n  { tag: 'position', x: -24, y: -12, ox: -18, oy: -23 },\n  { tag: 'angle', a: -615, oa: -600 },\n  { tag: 'position', x: -27, y: 0, ox: -24, oy: -12 },\n  { tag: 'angle', a: -630, oa: -615 },\n  { tag: 'position', x: -27, y: 13, ox: -27, oy: 0 },\n  { tag: 'angle', a: -645, oa: -630 },\n  { tag: 'position', x: -24, y: 26, ox: -27, oy: 13 },\n  { tag: 'angle', a: -660, oa: -645 },\n  { tag: 'position', x: -17, y: 38, ox: -24, oy: 26 },\n  { tag: 'angle', a: -675, oa: -660 },\n  { tag: 'position', x: -7, y: 48, ox: -17, oy: 38 },\n  { tag: 'angle', a: -690, oa: -675 },\n  { tag: 'position', x: 5, y: 55, ox: -7, oy: 48 },\n  { tag: 'angle', a: -705, oa: -690 },\n  { tag: 'position', x: 19, y: 59, ox: 5, oy: 55 },\n  { tag: 'angle', a: -720, oa: -705 },\n  { tag: 'position', x: 34, y: 59, ox: 19, oy: 59 },\n  { tag: 'angle', a: -735, oa: -720 },\n  { tag: 'position', x: 48, y: 55, ox: 34, oy: 59 },\n  { tag: 'angle', a: -750, oa: -735 },\n  { tag: 'position', x: 61, y: 47, ox: 48, oy: 55 },\n  { tag: 'angle', a: -765, oa: -750 },\n  { tag: 'position', x: 72, y: 36, ox: 61, oy: 47 },\n  { tag: 'angle', a: -780, oa: -765 },\n  { tag: 'position', x: 80, y: 22, ox: 72, oy: 36 },\n  { tag: 'angle', a: -795, oa: -780 },\n  { tag: 'position', x: 84, y: 6, ox: 80, oy: 22 },\n  { tag: 'angle', a: -810, oa: -795 },\n  { tag: 'position', x: 84, y: -10, ox: 84, oy: 6 },\n  { tag: 'angle', a: -825, oa: -810 },\n  { tag: 'position', x: 80, y: -26, ox: 84, oy: -10 },\n  { tag: 'angle', a: -840, oa: -825 },\n  { tag: 'position', x: 71, y: -41, ox: 80, oy: -26 },\n  { tag: 'angle', a: -855, oa: -840 },\n  { tag: 'position', x: 59, y: -53, ox: 71, oy: -41 },\n  { tag: 'angle', a: -870, oa: -855 },\n  { tag: 'position', x: 44, y: -62, ox: 59, oy: -53 },\n  { tag: 'angle', a: -885, oa: -870 },\n  { tag: 'position', x: 27, y: -67, ox: 44, oy: -62 },\n  { tag: 'angle', a: -900, oa: -885 },\n  { tag: 'position', x: 9, y: -67, ox: 27, oy: -67 },\n  { tag: 'angle', a: -915, oa: -900 },\n  { tag: 'position', x: -9, y: -62, ox: 9, oy: -67 },\n  { tag: 'angle', a: -930, oa: -915 },\n  { tag: 'position', x: -26, y: -52, ox: -9, oy: -62 },\n  { tag: 'angle', a: -945, oa: -930 },\n  { tag: 'position', x: -40, y: -38, ox: -26, oy: -52 },\n  { tag: 'angle', a: -960, oa: -945 },\n  { tag: 'position', x: -50, y: -21, ox: -40, oy: -38 },\n  { tag: 'angle', a: -975, oa: -960 },\n  { tag: 'position', x: -55, y: -1, ox: -50, oy: -21 },\n  { tag: 'angle', a: -990, oa: -975 },\n  { tag: 'position', x: -55, y: 20, ox: -55, oy: -1 },\n  { tag: 'angle', a: -1005, oa: -990 },\n  { tag: 'position', x: -50, y: 40, ox: -55, oy: 20 },\n  { tag: 'angle', a: -1020, oa: -1005 },\n  { tag: 'position', x: -39, y: 59, ox: -50, oy: 40 },\n  { tag: 'angle', a: -1035, oa: -1020 },\n  { tag: 'position', x: -23, y: 75, ox: -39, oy: 59 },\n  { tag: 'angle', a: -1050, oa: -1035 },\n  { tag: 'position', x: -3, y: 86, ox: -23, oy: 75 },\n  { tag: 'angle', a: -1065, oa: -1050 },\n  { tag: 'position', x: 19, y: 92, ox: -3, oy: 86 },\n  { tag: 'angle', a: -1080, oa: -1065 },\n  { tag: 'position', x: 42, y: 92, ox: 19, oy: 92 },\n  { tag: 'angle', a: -1095, oa: -1080 },\n  { tag: 'position', x: 65, y: 86, ox: 42, oy: 92 },\n  { tag: 'angle', a: -1110, oa: -1095 },\n  { tag: 'position', x: 86, y: 74, ox: 65, oy: 86 },\n  { tag: 'angle', a: -1125, oa: -1110 },\n  { tag: 'position', x: 104, y: 56, ox: 86, oy: 74 },\n  { tag: 'angle', a: -1140, oa: -1125 },\n  { tag: 'position', x: 117, y: 34, ox: 104, oy: 56 },\n  { tag: 'angle', a: -1155, oa: -1140 },\n  { tag: 'position', x: 124, y: 9, ox: 117, oy: 34 },\n  { tag: 'angle', a: -1170, oa: -1155 },\n  { tag: 'position', x: 124, y: -17, ox: 124, oy: 9 },\n  { tag: 'angle', a: -1185, oa: -1170 },\n  { tag: 'position', x: 117, y: -43, ox: 124, oy: -17 },\n  { tag: 'angle', a: -1200, oa: -1185 },\n  { tag: 'position', x: 103, y: -67, ox: 117, oy: -43 },\n  { tag: 'angle', a: -1215, oa: -1200 },\n  { tag: 'position', x: 83, y: -87, ox: 103, oy: -67 },\n  { tag: 'angle', a: -1230, oa: -1215 },\n  { tag: 'position', x: 58, y: -101, ox: 83, oy: -87 },\n  { tag: 'angle', a: -1245, oa: -1230 },\n  { tag: 'position', x: 30, y: -109, ox: 58, oy: -101 },\n  { tag: 'angle', a: -1260, oa: -1245 },\n  { tag: 'position', x: 0, y: -109, ox: 30, oy: -109 },\n  { tag: 'angle', a: -1275, oa: -1260 } ]" + "\n     Input:  ['definespiral(size){if(size<30){forward(size);right(15);varnewsize;newsize:=size*1.02;spiral(newsize);}}spiral(5);']");
  }
});

test("define square(x) {repeat(4) {forward(x);right(90);    }}square(100);square(20);", function () {
  var result = suites.stat.apply(null, ['define square(x) {repeat(4) {forward(x);right(90);    }}square(100);square(20);']);
  var pass = _.isEqual(result, [{
    tag: 'position',
    x: 0,
    y: 100,
    ox: 0,
    oy: 0
  }, {
    tag: 'angle',
    a: 0,
    oa: 90
  }, {
    tag: 'position',
    x: 100,
    y: 100,
    ox: 0,
    oy: 100
  }, {
    tag: 'angle',
    a: -90,
    oa: 0
  }, {
    tag: 'position',
    x: 100,
    y: 0,
    ox: 100,
    oy: 100
  }, {
    tag: 'angle',
    a: -180,
    oa: -90
  }, {
    tag: 'position',
    x: 0,
    y: 0,
    ox: 100,
    oy: 0
  }, {
    tag: 'angle',
    a: -270,
    oa: -180
  }, {
    tag: 'position',
    x: 0,
    y: 20,
    ox: 0,
    oy: 0
  }, {
    tag: 'angle',
    a: -360,
    oa: -270
  }, {
    tag: 'position',
    x: 20,
    y: 20,
    ox: 0,
    oy: 20
  }, {
    tag: 'angle',
    a: -450,
    oa: -360
  }, {
    tag: 'position',
    x: 20,
    y: 0,
    ox: 20,
    oy: 20
  }, {
    tag: 'angle',
    a: -540,
    oa: -450
  }, {
    tag: 'position',
    x: 0,
    y: 0,
    ox: 20,
    oy: 0
  }, {
    tag: 'angle',
    a: -630,
    oa: -540
  }]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ { tag: 'position', x: 0, y: 100, ox: 0, oy: 0 },\n  { tag: 'angle', a: 0, oa: 90 },\n  { tag: 'position', x: 100, y: 100, ox: 0, oy: 100 },\n  { tag: 'angle', a: -90, oa: 0 },\n  { tag: 'position', x: 100, y: 0, ox: 100, oy: 100 },\n  { tag: 'angle', a: -180, oa: -90 },\n  { tag: 'position', x: 0, y: 0, ox: 100, oy: 0 },\n  { tag: 'angle', a: -270, oa: -180 },\n  { tag: 'position', x: 0, y: 20, ox: 0, oy: 0 },\n  { tag: 'angle', a: -360, oa: -270 },\n  { tag: 'position', x: 20, y: 20, ox: 0, oy: 20 },\n  { tag: 'angle', a: -450, oa: -360 },\n  { tag: 'position', x: 20, y: 0, ox: 20, oy: 20 },\n  { tag: 'angle', a: -540, oa: -450 },\n  { tag: 'position', x: 0, y: 0, ox: 20, oy: 0 },\n  { tag: 'angle', a: -630, oa: -540 } ]" + "\n     Input:  ['definesquare(x){repeat(4){forward(x);right(90);}}square(100);square(20);']");
  }
});

test("f()", function () {
  var flag = true;
  try {
    suites.stat.apply(null, ['f()']);
  }
  catch (e) {
    flag = false;
    if (!_.isEqual(e.toString(), 'SyntaxError: "!=","*","+","-","/",";","<","<=","==",">",">=",[ \\n\\r\\t]')) {
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

suite("ext");

test("forward(3);", function () {
  var result = suites.ext.apply(null, ['forward(3);']);
  var pass = _.isEqual(result, [{
    tag: 'position',
    x: 0,
    y: 3,
    ox: 0,
    oy: 0
  }]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ { tag: 'position', x: 0, y: 3, ox: 0, oy: 0 } ]" + "\n     Input:  ['forward(3);']");
  }
});

test("forward(3); left(45); back(7); right(45);", function () {
  var result = suites.ext.apply(null, ['forward(3); left(45); back(7); right(45);']);
  var pass = _.isEqual(result, [{
    tag: 'position',
    x: 0,
    y: 3,
    ox: 0,
    oy: 0
  }, {
    tag: 'angle',
    a: 135,
    oa: 90
  }, {
    tag: 'position',
    x: 5,
    y: -2,
    ox: 0,
    oy: 3
  }, {
    tag: 'angle',
    a: 90,
    oa: 135
  }]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ { tag: 'position', x: 0, y: 3, ox: 0, oy: 0 },\n  { tag: 'angle', a: 135, oa: 90 },\n  { tag: 'position', x: 5, y: -2, ox: 0, oy: 3 },\n  { tag: 'angle', a: 90, oa: 135 } ]" + "\n     Input:  ['forward(3);left(45);back(7);right(45);']");
  }
});

test("penup(); right(30); forward(5); pendown(); speed(2); left(60); forward(1); eraser(); back(2); home(); back(5); clear();", function () {
  var result = suites.ext.apply(null, ['penup(); right(30); forward(5); pendown(); speed(2); left(60); forward(1); eraser(); back(2); home(); back(5); clear();']);
  var pass = _.isEqual(result, [{
    tag: 'penup'
  }, {
    tag: 'angle',
    a: 60,
    oa: 90
  }, {
    tag: 'position',
    x: 3,
    y: 4,
    ox: 0,
    oy: 0
  }, {
    tag: 'pendown'
  }, {
    tag: 'speed',
    speed: 2
  }, {
    tag: 'angle',
    a: 120,
    oa: 60
  }, {
    tag: 'position',
    x: 3,
    y: 5,
    ox: 3,
    oy: 4
  }, {
    tag: 'eraser'
  }, {
    tag: 'position',
    x: 4,
    y: 3,
    ox: 3,
    oy: 5
  }, {
    tag: 'position',
    x: 0,
    y: 0,
    ox: 4,
    oy: 3
  }, {
    tag: 'angle',
    a: 90,
    oa: 120
  }, {
    tag: 'position',
    x: 0,
    y: -5,
    ox: 0,
    oy: 0
  }, {
    tag: 'clear'
  }, {
    tag: 'position',
    x: 0,
    y: 0,
    ox: 0,
    oy: -5
  }, {
    tag: 'angle',
    a: 90,
    oa: 90
  }]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ { tag: 'penup' },\n  { tag: 'angle', a: 60, oa: 90 },\n  { tag: 'position', x: 3, y: 4, ox: 0, oy: 0 },\n  { tag: 'pendown' },\n  { tag: 'speed', speed: 2 },\n  { tag: 'angle', a: 120, oa: 60 },\n  { tag: 'position', x: 3, y: 5, ox: 3, oy: 4 },\n  { tag: 'eraser' },\n  { tag: 'position', x: 4, y: 3, ox: 3, oy: 5 },\n  { tag: 'position', x: 0, y: 0, ox: 4, oy: 3 },\n  { tag: 'angle', a: 90, oa: 120 },\n  { tag: 'position', x: 0, y: -5, ox: 0, oy: 0 },\n  { tag: 'clear' },\n  { tag: 'position', x: 0, y: 0, ox: 0, oy: -5 },\n  { tag: 'angle', a: 90, oa: 90 } ]" + "\n     Input:  ['penup();right(30);forward(5);pendown();speed(2);left(60);forward(1);eraser();back(2);home();back(5);clear();']");
  }
});

test("penup(); forward(5); pendown(); speed(2);  forward(1); eraser(); back(2); home(); back(5); clear();", function () {
  var result = suites.ext.apply(null, ['penup(); forward(5); pendown(); speed(2);  forward(1); eraser(); back(2); home(); back(5); clear();']);
  var pass = _.isEqual(result, [{
    tag: 'penup'
  }, {
    tag: 'position',
    x: 0,
    y: 5,
    ox: 0,
    oy: 0
  }, {
    tag: 'pendown'
  }, {
    tag: 'speed',
    speed: 2
  }, {
    tag: 'position',
    x: 0,
    y: 6,
    ox: 0,
    oy: 5
  }, {
    tag: 'eraser'
  }, {
    tag: 'position',
    x: 0,
    y: 4,
    ox: 0,
    oy: 6
  }, {
    tag: 'position',
    x: 0,
    y: 0,
    ox: 0,
    oy: 4
  }, {
    tag: 'angle',
    a: 90,
    oa: 90
  }, {
    tag: 'position',
    x: 0,
    y: -5,
    ox: 0,
    oy: 0
  }, {
    tag: 'clear'
  }, {
    tag: 'position',
    x: 0,
    y: 0,
    ox: 0,
    oy: -5
  }, {
    tag: 'angle',
    a: 90,
    oa: 90
  }]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ { tag: 'penup' },\n  { tag: 'position', x: 0, y: 5, ox: 0, oy: 0 },\n  { tag: 'pendown' },\n  { tag: 'speed', speed: 2 },\n  { tag: 'position', x: 0, y: 6, ox: 0, oy: 5 },\n  { tag: 'eraser' },\n  { tag: 'position', x: 0, y: 4, ox: 0, oy: 6 },\n  { tag: 'position', x: 0, y: 0, ox: 0, oy: 4 },\n  { tag: 'angle', a: 90, oa: 90 },\n  { tag: 'position', x: 0, y: -5, ox: 0, oy: 0 },\n  { tag: 'clear' },\n  { tag: 'position', x: 0, y: 0, ox: 0, oy: -5 },\n  { tag: 'angle', a: 90, oa: 90 } ]" + "\n     Input:  ['penup();forward(5);pendown();speed(2);forward(1);eraser();back(2);home();back(5);clear();']");
  }
});

test("penup(); pendown(); speed(2); eraser(); home(); clear();", function () {
  var result = suites.ext.apply(null, ['penup(); pendown(); speed(2); eraser(); home(); clear();']);
  var pass = _.isEqual(result, [{
    tag: 'penup'
  }, {
    tag: 'pendown'
  }, {
    tag: 'speed',
    speed: 2
  }, {
    tag: 'eraser'
  }, {
    tag: 'position',
    x: 0,
    y: 0,
    ox: 0,
    oy: 0
  }, {
    tag: 'angle',
    a: 90,
    oa: 90
  }, {
    tag: 'clear'
  }, {
    tag: 'position',
    x: 0,
    y: 0,
    ox: 0,
    oy: 0
  }, {
    tag: 'angle',
    a: 90,
    oa: 90
  }]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ { tag: 'penup' },\n  { tag: 'pendown' },\n  { tag: 'speed', speed: 2 },\n  { tag: 'eraser' },\n  { tag: 'position', x: 0, y: 0, ox: 0, oy: 0 },\n  { tag: 'angle', a: 90, oa: 90 },\n  { tag: 'clear' },\n  { tag: 'position', x: 0, y: 0, ox: 0, oy: 0 },\n  { tag: 'angle', a: 90, oa: 90 } ]" + "\n     Input:  ['penup();pendown();speed(2);eraser();home();clear();']");
  }
});

test("forward(5);speed(2);  forward(1);  back(2);  back(5);", function () {
  var result = suites.ext.apply(null, ['forward(5);speed(2);  forward(1);  back(2);  back(5);']);
  var pass = _.isEqual(result, [{
    tag: 'position',
    x: 0,
    y: 5,
    ox: 0,
    oy: 0
  }, {
    tag: 'speed',
    speed: 2
  }, {
    tag: 'position',
    x: 0,
    y: 6,
    ox: 0,
    oy: 5
  }, {
    tag: 'position',
    x: 0,
    y: 4,
    ox: 0,
    oy: 6
  }, {
    tag: 'position',
    x: 0,
    y: -1,
    ox: 0,
    oy: 4
  }]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ { tag: 'position', x: 0, y: 5, ox: 0, oy: 0 },\n  { tag: 'speed', speed: 2 },\n  { tag: 'position', x: 0, y: 6, ox: 0, oy: 5 },\n  { tag: 'position', x: 0, y: 4, ox: 0, oy: 6 },\n  { tag: 'position', x: 0, y: -1, ox: 0, oy: 4 } ]" + "\n     Input:  ['forward(5);speed(2);forward(1);back(2);back(5);']");
  }
});

test(" forward(1);  back(2);", function () {
  var result = suites.ext.apply(null, [' forward(1);  back(2);']);
  var pass = _.isEqual(result, [{
    tag: 'position',
    x: 0,
    y: 1,
    ox: 0,
    oy: 0
  }, {
    tag: 'position',
    x: 0,
    y: -1,
    ox: 0,
    oy: 1
  }]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ { tag: 'position', x: 0, y: 1, ox: 0, oy: 0 },\n  { tag: 'position', x: 0, y: -1, ox: 0, oy: 1 } ]" + "\n     Input:  ['forward(1);back(2);']");
  }
});

test(" back(2);", function () {
  var result = suites.ext.apply(null, [' back(2);']);
  var pass = _.isEqual(result, [{
    tag: 'position',
    x: 0,
    y: -2,
    ox: 0,
    oy: 0
  }]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ { tag: 'position', x: 0, y: -2, ox: 0, oy: 0 } ]" + "\n     Input:  ['back(2);']");
  }
});

test("color('#05a');", function () {
  var result = suites.ext.apply(null, ['color(\'#05a\');']);
  var pass = _.isEqual(result, [{
    tag: 'setColor',
    color: '#05a'
  }]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ { tag: 'setColor', color: '#05a' } ]" + "\n     Input:  ['color(\'#05a\');']");
  }
});