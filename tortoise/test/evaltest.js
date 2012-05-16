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
    tag: 'position',
    x: 0,
    y: 0
  }, {
    tag: 'angle',
    value: 90
  }, {
    tag: 'angle',
    value: 70
  }, {
    tag: 'position',
    x: 7,
    y: 19
  }, {
    tag: 'angle',
    value: 60
  }, {
    tag: 'position',
    x: 17,
    y: 36
  }, {
    tag: 'angle',
    value: 50
  }, {
    tag: 'position',
    x: 30,
    y: 51
  }, {
    tag: 'angle',
    value: 40
  }, {
    tag: 'angle',
    value: 20
  }, {
    tag: 'position',
    x: 49,
    y: 58
  }, {
    tag: 'angle',
    value: 10
  }, {
    tag: 'position',
    x: 69,
    y: 61
  }, {
    tag: 'angle',
    value: 0
  }, {
    tag: 'position',
    x: 89,
    y: 61
  }, {
    tag: 'angle',
    value: -10
  }]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ { tag: 'position', x: 0, y: 0 },\n  { tag: 'angle', value: 90 },\n  { tag: 'angle', value: 70 },\n  { tag: 'position', x: 7, y: 19 },\n  { tag: 'angle', value: 60 },\n  { tag: 'position', x: 17, y: 36 },\n  { tag: 'angle', value: 50 },\n  { tag: 'position', x: 30, y: 51 },\n  { tag: 'angle', value: 40 },\n  { tag: 'angle', value: 20 },\n  { tag: 'position', x: 49, y: 58 },\n  { tag: 'angle', value: 10 },\n  { tag: 'position', x: 69, y: 61 },\n  { tag: 'angle', value: 0 },\n  { tag: 'position', x: 89, y: 61 },\n  { tag: 'angle', value: -10 } ]" + "\n     Input:  ['repeat(2){right(20);repeat(3){forward(20);right(10);}}']");
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
    y: 0
  }, {
    tag: 'angle',
    value: 90
  }, {
    tag: 'position',
    x: 0,
    y: 5
  }, {
    tag: 'angle',
    value: 75
  }, {
    tag: 'position',
    x: 1,
    y: 10
  }, {
    tag: 'angle',
    value: 60
  }, {
    tag: 'position',
    x: 4,
    y: 15
  }, {
    tag: 'angle',
    value: 45
  }, {
    tag: 'position',
    x: 8,
    y: 19
  }, {
    tag: 'angle',
    value: 30
  }, {
    tag: 'position',
    x: 13,
    y: 22
  }, {
    tag: 'angle',
    value: 15
  }, {
    tag: 'position',
    x: 18,
    y: 23
  }, {
    tag: 'angle',
    value: 0
  }, {
    tag: 'position',
    x: 24,
    y: 23
  }, {
    tag: 'angle',
    value: -15
  }, {
    tag: 'position',
    x: 30,
    y: 22
  }, {
    tag: 'angle',
    value: -30
  }, {
    tag: 'position',
    x: 35,
    y: 19
  }, {
    tag: 'angle',
    value: -45
  }, {
    tag: 'position',
    x: 39,
    y: 15
  }, {
    tag: 'angle',
    value: -60
  }, {
    tag: 'position',
    x: 42,
    y: 10
  }, {
    tag: 'angle',
    value: -75
  }, {
    tag: 'position',
    x: 44,
    y: 4
  }, {
    tag: 'angle',
    value: -90
  }, {
    tag: 'position',
    x: 44,
    y: -2
  }, {
    tag: 'angle',
    value: -105
  }, {
    tag: 'position',
    x: 42,
    y: -8
  }, {
    tag: 'angle',
    value: -120
  }, {
    tag: 'position',
    x: 39,
    y: -14
  }, {
    tag: 'angle',
    value: -135
  }, {
    tag: 'position',
    x: 34,
    y: -19
  }, {
    tag: 'angle',
    value: -150
  }, {
    tag: 'position',
    x: 28,
    y: -22
  }, {
    tag: 'angle',
    value: -165
  }, {
    tag: 'position',
    x: 21,
    y: -24
  }, {
    tag: 'angle',
    value: -180
  }, {
    tag: 'position',
    x: 14,
    y: -24
  }, {
    tag: 'angle',
    value: -195
  }, {
    tag: 'position',
    x: 7,
    y: -22
  }, {
    tag: 'angle',
    value: -210
  }, {
    tag: 'position',
    x: 1,
    y: -18
  }, {
    tag: 'angle',
    value: -225
  }, {
    tag: 'position',
    x: -4,
    y: -13
  }, {
    tag: 'angle',
    value: -240
  }, {
    tag: 'position',
    x: -8,
    y: -6
  }, {
    tag: 'angle',
    value: -255
  }, {
    tag: 'position',
    x: -10,
    y: 2
  }, {
    tag: 'angle',
    value: -270
  }, {
    tag: 'position',
    x: -10,
    y: 10
  }, {
    tag: 'angle',
    value: -285
  }, {
    tag: 'position',
    x: -8,
    y: 18
  }, {
    tag: 'angle',
    value: -300
  }, {
    tag: 'position',
    x: -4,
    y: 25
  }, {
    tag: 'angle',
    value: -315
  }, {
    tag: 'position',
    x: 2,
    y: 31
  }, {
    tag: 'angle',
    value: -330
  }, {
    tag: 'position',
    x: 10,
    y: 35
  }, {
    tag: 'angle',
    value: -345
  }, {
    tag: 'position',
    x: 19,
    y: 37
  }, {
    tag: 'angle',
    value: -360
  }, {
    tag: 'position',
    x: 28,
    y: 37
  }, {
    tag: 'angle',
    value: -375
  }, {
    tag: 'position',
    x: 37,
    y: 35
  }, {
    tag: 'angle',
    value: -390
  }, {
    tag: 'position',
    x: 45,
    y: 30
  }, {
    tag: 'angle',
    value: -405
  }, {
    tag: 'position',
    x: 52,
    y: 23
  }, {
    tag: 'angle',
    value: -420
  }, {
    tag: 'position',
    x: 57,
    y: 15
  }, {
    tag: 'angle',
    value: -435
  }, {
    tag: 'position',
    x: 60,
    y: 5
  }, {
    tag: 'angle',
    value: -450
  }, {
    tag: 'position',
    x: 60,
    y: -5
  }, {
    tag: 'angle',
    value: -465
  }, {
    tag: 'position',
    x: 57,
    y: -15
  }, {
    tag: 'angle',
    value: -480
  }, {
    tag: 'position',
    x: 52,
    y: -24
  }, {
    tag: 'angle',
    value: -495
  }, {
    tag: 'position',
    x: 44,
    y: -32
  }, {
    tag: 'angle',
    value: -510
  }, {
    tag: 'position',
    x: 34,
    y: -38
  }, {
    tag: 'angle',
    value: -525
  }, {
    tag: 'position',
    x: 23,
    y: -41
  }, {
    tag: 'angle',
    value: -540
  }, {
    tag: 'position',
    x: 12,
    y: -41
  }, {
    tag: 'angle',
    value: -555
  }, {
    tag: 'position',
    x: 1,
    y: -38
  }, {
    tag: 'angle',
    value: -570
  }, {
    tag: 'position',
    x: -9,
    y: -32
  }, {
    tag: 'angle',
    value: -585
  }, {
    tag: 'position',
    x: -18,
    y: -23
  }, {
    tag: 'angle',
    value: -600
  }, {
    tag: 'position',
    x: -24,
    y: -12
  }, {
    tag: 'angle',
    value: -615
  }, {
    tag: 'position',
    x: -27,
    y: 0
  }, {
    tag: 'angle',
    value: -630
  }, {
    tag: 'position',
    x: -27,
    y: 13
  }, {
    tag: 'angle',
    value: -645
  }, {
    tag: 'position',
    x: -24,
    y: 26
  }, {
    tag: 'angle',
    value: -660
  }, {
    tag: 'position',
    x: -17,
    y: 38
  }, {
    tag: 'angle',
    value: -675
  }, {
    tag: 'position',
    x: -7,
    y: 48
  }, {
    tag: 'angle',
    value: -690
  }, {
    tag: 'position',
    x: 5,
    y: 55
  }, {
    tag: 'angle',
    value: -705
  }, {
    tag: 'position',
    x: 19,
    y: 59
  }, {
    tag: 'angle',
    value: -720
  }, {
    tag: 'position',
    x: 34,
    y: 59
  }, {
    tag: 'angle',
    value: -735
  }, {
    tag: 'position',
    x: 48,
    y: 55
  }, {
    tag: 'angle',
    value: -750
  }, {
    tag: 'position',
    x: 61,
    y: 47
  }, {
    tag: 'angle',
    value: -765
  }, {
    tag: 'position',
    x: 72,
    y: 36
  }, {
    tag: 'angle',
    value: -780
  }, {
    tag: 'position',
    x: 80,
    y: 22
  }, {
    tag: 'angle',
    value: -795
  }, {
    tag: 'position',
    x: 84,
    y: 6
  }, {
    tag: 'angle',
    value: -810
  }, {
    tag: 'position',
    x: 84,
    y: -10
  }, {
    tag: 'angle',
    value: -825
  }, {
    tag: 'position',
    x: 80,
    y: -26
  }, {
    tag: 'angle',
    value: -840
  }, {
    tag: 'position',
    x: 71,
    y: -41
  }, {
    tag: 'angle',
    value: -855
  }, {
    tag: 'position',
    x: 59,
    y: -53
  }, {
    tag: 'angle',
    value: -870
  }, {
    tag: 'position',
    x: 44,
    y: -62
  }, {
    tag: 'angle',
    value: -885
  }, {
    tag: 'position',
    x: 27,
    y: -67
  }, {
    tag: 'angle',
    value: -900
  }, {
    tag: 'position',
    x: 9,
    y: -67
  }, {
    tag: 'angle',
    value: -915
  }, {
    tag: 'position',
    x: -9,
    y: -62
  }, {
    tag: 'angle',
    value: -930
  }, {
    tag: 'position',
    x: -26,
    y: -52
  }, {
    tag: 'angle',
    value: -945
  }, {
    tag: 'position',
    x: -40,
    y: -38
  }, {
    tag: 'angle',
    value: -960
  }, {
    tag: 'position',
    x: -50,
    y: -21
  }, {
    tag: 'angle',
    value: -975
  }, {
    tag: 'position',
    x: -55,
    y: -1
  }, {
    tag: 'angle',
    value: -990
  }, {
    tag: 'position',
    x: -55,
    y: 20
  }, {
    tag: 'angle',
    value: -1005
  }, {
    tag: 'position',
    x: -50,
    y: 40
  }, {
    tag: 'angle',
    value: -1020
  }, {
    tag: 'position',
    x: -39,
    y: 59
  }, {
    tag: 'angle',
    value: -1035
  }, {
    tag: 'position',
    x: -23,
    y: 75
  }, {
    tag: 'angle',
    value: -1050
  }, {
    tag: 'position',
    x: -3,
    y: 86
  }, {
    tag: 'angle',
    value: -1065
  }, {
    tag: 'position',
    x: 19,
    y: 92
  }, {
    tag: 'angle',
    value: -1080
  }, {
    tag: 'position',
    x: 42,
    y: 92
  }, {
    tag: 'angle',
    value: -1095
  }, {
    tag: 'position',
    x: 65,
    y: 86
  }, {
    tag: 'angle',
    value: -1110
  }, {
    tag: 'position',
    x: 86,
    y: 74
  }, {
    tag: 'angle',
    value: -1125
  }, {
    tag: 'position',
    x: 104,
    y: 56
  }, {
    tag: 'angle',
    value: -1140
  }, {
    tag: 'position',
    x: 117,
    y: 34
  }, {
    tag: 'angle',
    value: -1155
  }, {
    tag: 'position',
    x: 124,
    y: 9
  }, {
    tag: 'angle',
    value: -1170
  }, {
    tag: 'position',
    x: 124,
    y: -17
  }, {
    tag: 'angle',
    value: -1185
  }, {
    tag: 'position',
    x: 117,
    y: -43
  }, {
    tag: 'angle',
    value: -1200
  }, {
    tag: 'position',
    x: 103,
    y: -67
  }, {
    tag: 'angle',
    value: -1215
  }, {
    tag: 'position',
    x: 83,
    y: -87
  }, {
    tag: 'angle',
    value: -1230
  }, {
    tag: 'position',
    x: 58,
    y: -101
  }, {
    tag: 'angle',
    value: -1245
  }, {
    tag: 'position',
    x: 30,
    y: -109
  }, {
    tag: 'angle',
    value: -1260
  }, {
    tag: 'position',
    x: 0,
    y: -109
  }, {
    tag: 'angle',
    value: -1275
  }]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ { tag: 'position', x: 0, y: 0 },\n  { tag: 'angle', value: 90 },\n  { tag: 'position', x: 0, y: 5 },\n  { tag: 'angle', value: 75 },\n  { tag: 'position', x: 1, y: 10 },\n  { tag: 'angle', value: 60 },\n  { tag: 'position', x: 4, y: 15 },\n  { tag: 'angle', value: 45 },\n  { tag: 'position', x: 8, y: 19 },\n  { tag: 'angle', value: 30 },\n  { tag: 'position', x: 13, y: 22 },\n  { tag: 'angle', value: 15 },\n  { tag: 'position', x: 18, y: 23 },\n  { tag: 'angle', value: 0 },\n  { tag: 'position', x: 24, y: 23 },\n  { tag: 'angle', value: -15 },\n  { tag: 'position', x: 30, y: 22 },\n  { tag: 'angle', value: -30 },\n  { tag: 'position', x: 35, y: 19 },\n  { tag: 'angle', value: -45 },\n  { tag: 'position', x: 39, y: 15 },\n  { tag: 'angle', value: -60 },\n  { tag: 'position', x: 42, y: 10 },\n  { tag: 'angle', value: -75 },\n  { tag: 'position', x: 44, y: 4 },\n  { tag: 'angle', value: -90 },\n  { tag: 'position', x: 44, y: -2 },\n  { tag: 'angle', value: -105 },\n  { tag: 'position', x: 42, y: -8 },\n  { tag: 'angle', value: -120 },\n  { tag: 'position', x: 39, y: -14 },\n  { tag: 'angle', value: -135 },\n  { tag: 'position', x: 34, y: -19 },\n  { tag: 'angle', value: -150 },\n  { tag: 'position', x: 28, y: -22 },\n  { tag: 'angle', value: -165 },\n  { tag: 'position', x: 21, y: -24 },\n  { tag: 'angle', value: -180 },\n  { tag: 'position', x: 14, y: -24 },\n  { tag: 'angle', value: -195 },\n  { tag: 'position', x: 7, y: -22 },\n  { tag: 'angle', value: -210 },\n  { tag: 'position', x: 1, y: -18 },\n  { tag: 'angle', value: -225 },\n  { tag: 'position', x: -4, y: -13 },\n  { tag: 'angle', value: -240 },\n  { tag: 'position', x: -8, y: -6 },\n  { tag: 'angle', value: -255 },\n  { tag: 'position', x: -10, y: 2 },\n  { tag: 'angle', value: -270 },\n  { tag: 'position', x: -10, y: 10 },\n  { tag: 'angle', value: -285 },\n  { tag: 'position', x: -8, y: 18 },\n  { tag: 'angle', value: -300 },\n  { tag: 'position', x: -4, y: 25 },\n  { tag: 'angle', value: -315 },\n  { tag: 'position', x: 2, y: 31 },\n  { tag: 'angle', value: -330 },\n  { tag: 'position', x: 10, y: 35 },\n  { tag: 'angle', value: -345 },\n  { tag: 'position', x: 19, y: 37 },\n  { tag: 'angle', value: -360 },\n  { tag: 'position', x: 28, y: 37 },\n  { tag: 'angle', value: -375 },\n  { tag: 'position', x: 37, y: 35 },\n  { tag: 'angle', value: -390 },\n  { tag: 'position', x: 45, y: 30 },\n  { tag: 'angle', value: -405 },\n  { tag: 'position', x: 52, y: 23 },\n  { tag: 'angle', value: -420 },\n  { tag: 'position', x: 57, y: 15 },\n  { tag: 'angle', value: -435 },\n  { tag: 'position', x: 60, y: 5 },\n  { tag: 'angle', value: -450 },\n  { tag: 'position', x: 60, y: -5 },\n  { tag: 'angle', value: -465 },\n  { tag: 'position', x: 57, y: -15 },\n  { tag: 'angle', value: -480 },\n  { tag: 'position', x: 52, y: -24 },\n  { tag: 'angle', value: -495 },\n  { tag: 'position', x: 44, y: -32 },\n  { tag: 'angle', value: -510 },\n  { tag: 'position', x: 34, y: -38 },\n  { tag: 'angle', value: -525 },\n  { tag: 'position', x: 23, y: -41 },\n  { tag: 'angle', value: -540 },\n  { tag: 'position', x: 12, y: -41 },\n  { tag: 'angle', value: -555 },\n  { tag: 'position', x: 1, y: -38 },\n  { tag: 'angle', value: -570 },\n  { tag: 'position', x: -9, y: -32 },\n  { tag: 'angle', value: -585 },\n  { tag: 'position', x: -18, y: -23 },\n  { tag: 'angle', value: -600 },\n  { tag: 'position', x: -24, y: -12 },\n  { tag: 'angle', value: -615 },\n  { tag: 'position', x: -27, y: 0 },\n  { tag: 'angle', value: -630 },\n  { tag: 'position', x: -27, y: 13 },\n  { tag: 'angle', value: -645 },\n  { tag: 'position', x: -24, y: 26 },\n  { tag: 'angle', value: -660 },\n  { tag: 'position', x: -17, y: 38 },\n  { tag: 'angle', value: -675 },\n  { tag: 'position', x: -7, y: 48 },\n  { tag: 'angle', value: -690 },\n  { tag: 'position', x: 5, y: 55 },\n  { tag: 'angle', value: -705 },\n  { tag: 'position', x: 19, y: 59 },\n  { tag: 'angle', value: -720 },\n  { tag: 'position', x: 34, y: 59 },\n  { tag: 'angle', value: -735 },\n  { tag: 'position', x: 48, y: 55 },\n  { tag: 'angle', value: -750 },\n  { tag: 'position', x: 61, y: 47 },\n  { tag: 'angle', value: -765 },\n  { tag: 'position', x: 72, y: 36 },\n  { tag: 'angle', value: -780 },\n  { tag: 'position', x: 80, y: 22 },\n  { tag: 'angle', value: -795 },\n  { tag: 'position', x: 84, y: 6 },\n  { tag: 'angle', value: -810 },\n  { tag: 'position', x: 84, y: -10 },\n  { tag: 'angle', value: -825 },\n  { tag: 'position', x: 80, y: -26 },\n  { tag: 'angle', value: -840 },\n  { tag: 'position', x: 71, y: -41 },\n  { tag: 'angle', value: -855 },\n  { tag: 'position', x: 59, y: -53 },\n  { tag: 'angle', value: -870 },\n  { tag: 'position', x: 44, y: -62 },\n  { tag: 'angle', value: -885 },\n  { tag: 'position', x: 27, y: -67 },\n  { tag: 'angle', value: -900 },\n  { tag: 'position', x: 9, y: -67 },\n  { tag: 'angle', value: -915 },\n  { tag: 'position', x: -9, y: -62 },\n  { tag: 'angle', value: -930 },\n  { tag: 'position', x: -26, y: -52 },\n  { tag: 'angle', value: -945 },\n  { tag: 'position', x: -40, y: -38 },\n  { tag: 'angle', value: -960 },\n  { tag: 'position', x: -50, y: -21 },\n  { tag: 'angle', value: -975 },\n  { tag: 'position', x: -55, y: -1 },\n  { tag: 'angle', value: -990 },\n  { tag: 'position', x: -55, y: 20 },\n  { tag: 'angle', value: -1005 },\n  { tag: 'position', x: -50, y: 40 },\n  { tag: 'angle', value: -1020 },\n  { tag: 'position', x: -39, y: 59 },\n  { tag: 'angle', value: -1035 },\n  { tag: 'position', x: -23, y: 75 },\n  { tag: 'angle', value: -1050 },\n  { tag: 'position', x: -3, y: 86 },\n  { tag: 'angle', value: -1065 },\n  { tag: 'position', x: 19, y: 92 },\n  { tag: 'angle', value: -1080 },\n  { tag: 'position', x: 42, y: 92 },\n  { tag: 'angle', value: -1095 },\n  { tag: 'position', x: 65, y: 86 },\n  { tag: 'angle', value: -1110 },\n  { tag: 'position', x: 86, y: 74 },\n  { tag: 'angle', value: -1125 },\n  { tag: 'position', x: 104, y: 56 },\n  { tag: 'angle', value: -1140 },\n  { tag: 'position', x: 117, y: 34 },\n  { tag: 'angle', value: -1155 },\n  { tag: 'position', x: 124, y: 9 },\n  { tag: 'angle', value: -1170 },\n  { tag: 'position', x: 124, y: -17 },\n  { tag: 'angle', value: -1185 },\n  { tag: 'position', x: 117, y: -43 },\n  { tag: 'angle', value: -1200 },\n  { tag: 'position', x: 103, y: -67 },\n  { tag: 'angle', value: -1215 },\n  { tag: 'position', x: 83, y: -87 },\n  { tag: 'angle', value: -1230 },\n  { tag: 'position', x: 58, y: -101 },\n  { tag: 'angle', value: -1245 },\n  { tag: 'position', x: 30, y: -109 },\n  { tag: 'angle', value: -1260 },\n  { tag: 'position', x: 0, y: -109 },\n  { tag: 'angle', value: -1275 } ]" + "\n     Input:  ['definespiral(size){if(size<30){forward(size);right(15);varnewsize;newsize:=size*1.02;spiral(newsize);}}spiral(5);']");
  }
});

test("define square(x) {repeat(4) {forward(x);right(90);    }}square(100);square(20);", function () {
  var result = suites.stat.apply(null, ['define square(x) {repeat(4) {forward(x);right(90);    }}square(100);square(20);']);
  var pass = _.isEqual(result, [{
    tag: 'position',
    x: 0,
    y: 0
  }, {
    tag: 'angle',
    value: 90
  }, {
    tag: 'position',
    x: 0,
    y: 100
  }, {
    tag: 'angle',
    value: 0
  }, {
    tag: 'position',
    x: 100,
    y: 100
  }, {
    tag: 'angle',
    value: -90
  }, {
    tag: 'position',
    x: 100,
    y: 0
  }, {
    tag: 'angle',
    value: -180
  }, {
    tag: 'position',
    x: 0,
    y: 0
  }, {
    tag: 'angle',
    value: -270
  }, {
    tag: 'position',
    x: 0,
    y: 20
  }, {
    tag: 'angle',
    value: -360
  }, {
    tag: 'position',
    x: 20,
    y: 20
  }, {
    tag: 'angle',
    value: -450
  }, {
    tag: 'position',
    x: 20,
    y: 0
  }, {
    tag: 'angle',
    value: -540
  }, {
    tag: 'position',
    x: 0,
    y: 0
  }, {
    tag: 'angle',
    value: -630
  }]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ { tag: 'position', x: 0, y: 0 },\n  { tag: 'angle', value: 90 },\n  { tag: 'position', x: 0, y: 100 },\n  { tag: 'angle', value: 0 },\n  { tag: 'position', x: 100, y: 100 },\n  { tag: 'angle', value: -90 },\n  { tag: 'position', x: 100, y: 0 },\n  { tag: 'angle', value: -180 },\n  { tag: 'position', x: 0, y: 0 },\n  { tag: 'angle', value: -270 },\n  { tag: 'position', x: 0, y: 20 },\n  { tag: 'angle', value: -360 },\n  { tag: 'position', x: 20, y: 20 },\n  { tag: 'angle', value: -450 },\n  { tag: 'position', x: 20, y: 0 },\n  { tag: 'angle', value: -540 },\n  { tag: 'position', x: 0, y: 0 },\n  { tag: 'angle', value: -630 } ]" + "\n     Input:  ['definesquare(x){repeat(4){forward(x);right(90);}}square(100);square(20);']");
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

suite("ext");

test("forward(3);", function () {
  var result = suites.ext.apply(null, ['forward(3);']);
  var pass = _.isEqual(result, [{
    tag: 'position',
    x: 0,
    y: 0
  }, {
    tag: 'angle',
    value: 90
  }, {
    tag: 'position',
    x: 0,
    y: 3
  }]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ { tag: 'position', x: 0, y: 0 },\n  { tag: 'angle', value: 90 },\n  { tag: 'position', x: 0, y: 3 } ]" + "\n     Input:  ['forward(3);']");
  }
});

test("forward(3); left(45); back(7); right(45);", function () {
  var result = suites.ext.apply(null, ['forward(3); left(45); back(7); right(45);']);
  var pass = _.isEqual(result, [{
    tag: 'position',
    x: 0,
    y: 0
  }, {
    tag: 'angle',
    value: 90
  }, {
    tag: 'position',
    x: 0,
    y: 3
  }, {
    tag: 'angle',
    value: 135
  }, {
    tag: 'position',
    x: 5,
    y: -2
  }, {
    tag: 'angle',
    value: 90
  }]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ { tag: 'position', x: 0, y: 0 },\n  { tag: 'angle', value: 90 },\n  { tag: 'position', x: 0, y: 3 },\n  { tag: 'angle', value: 135 },\n  { tag: 'position', x: 5, y: -2 },\n  { tag: 'angle', value: 90 } ]" + "\n     Input:  ['forward(3);left(45);back(7);right(45);']");
  }
});

test("penup(); right(30); forward(5); pendown(); speed(2); left(60); forward(1); eraser(); back(2); home(); back(5); clear();", function () {
  var result = suites.ext.apply(null, ['penup(); right(30); forward(5); pendown(); speed(2); left(60); forward(1); eraser(); back(2); home(); back(5); clear();']);
  var pass = _.isEqual(result, [{
    tag: 'position',
    x: 0,
    y: 0
  }, {
    tag: 'angle',
    value: 90
  }, {
    tag: 'penup'
  }, {
    tag: 'angle',
    value: 60
  }, {
    tag: 'position',
    x: 3,
    y: 4
  }, {
    tag: 'pendown'
  }, {
    tag: 'speed',
    value: 2
  }, {
    tag: 'angle',
    value: 120
  }, {
    tag: 'position',
    x: 3,
    y: 5
  }, {
    tag: 'eraser'
  }, {
    tag: 'position',
    x: 4,
    y: 3
  }, {
    tag: 'position',
    x: 0,
    y: 0
  }, {
    tag: 'angle',
    value: 90
  }, {
    tag: 'position',
    x: 0,
    y: -5
  }, {
    tag: 'clear'
  }, {
    tag: 'position',
    x: 0,
    y: 0
  }, {
    tag: 'angle',
    value: 90
  }]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ { tag: 'position', x: 0, y: 0 },\n  { tag: 'angle', value: 90 },\n  { tag: 'penup' },\n  { tag: 'angle', value: 60 },\n  { tag: 'position', x: 3, y: 4 },\n  { tag: 'pendown' },\n  { tag: 'speed', value: 2 },\n  { tag: 'angle', value: 120 },\n  { tag: 'position', x: 3, y: 5 },\n  { tag: 'eraser' },\n  { tag: 'position', x: 4, y: 3 },\n  { tag: 'position', x: 0, y: 0 },\n  { tag: 'angle', value: 90 },\n  { tag: 'position', x: 0, y: -5 },\n  { tag: 'clear' },\n  { tag: 'position', x: 0, y: 0 },\n  { tag: 'angle', value: 90 } ]" + "\n     Input:  ['penup();right(30);forward(5);pendown();speed(2);left(60);forward(1);eraser();back(2);home();back(5);clear();']");
  }
});

test("penup(); forward(5); pendown(); speed(2);  forward(1); eraser(); back(2); home(); back(5); clear();", function () {
  var result = suites.ext.apply(null, ['penup(); forward(5); pendown(); speed(2);  forward(1); eraser(); back(2); home(); back(5); clear();']);
  var pass = _.isEqual(result, [{
    tag: 'position',
    x: 0,
    y: 0
  }, {
    tag: 'angle',
    value: 90
  }, {
    tag: 'penup'
  }, {
    tag: 'position',
    x: 0,
    y: 5
  }, {
    tag: 'pendown'
  }, {
    tag: 'speed',
    value: 2
  }, {
    tag: 'position',
    x: 0,
    y: 6
  }, {
    tag: 'eraser'
  }, {
    tag: 'position',
    x: 0,
    y: 4
  }, {
    tag: 'position',
    x: 0,
    y: 0
  }, {
    tag: 'angle',
    value: 90
  }, {
    tag: 'position',
    x: 0,
    y: -5
  }, {
    tag: 'clear'
  }, {
    tag: 'position',
    x: 0,
    y: 0
  }, {
    tag: 'angle',
    value: 90
  }]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ { tag: 'position', x: 0, y: 0 },\n  { tag: 'angle', value: 90 },\n  { tag: 'penup' },\n  { tag: 'position', x: 0, y: 5 },\n  { tag: 'pendown' },\n  { tag: 'speed', value: 2 },\n  { tag: 'position', x: 0, y: 6 },\n  { tag: 'eraser' },\n  { tag: 'position', x: 0, y: 4 },\n  { tag: 'position', x: 0, y: 0 },\n  { tag: 'angle', value: 90 },\n  { tag: 'position', x: 0, y: -5 },\n  { tag: 'clear' },\n  { tag: 'position', x: 0, y: 0 },\n  { tag: 'angle', value: 90 } ]" + "\n     Input:  ['penup();forward(5);pendown();speed(2);forward(1);eraser();back(2);home();back(5);clear();']");
  }
});

test("penup(); pendown(); speed(2); eraser(); home(); clear();", function () {
  var result = suites.ext.apply(null, ['penup(); pendown(); speed(2); eraser(); home(); clear();']);
  var pass = _.isEqual(result, [{
    tag: 'position',
    x: 0,
    y: 0
  }, {
    tag: 'angle',
    value: 90
  }, {
    tag: 'penup'
  }, {
    tag: 'pendown'
  }, {
    tag: 'speed',
    value: 2
  }, {
    tag: 'eraser'
  }, {
    tag: 'position',
    x: 0,
    y: 0
  }, {
    tag: 'angle',
    value: 90
  }, {
    tag: 'clear'
  }, {
    tag: 'position',
    x: 0,
    y: 0
  }, {
    tag: 'angle',
    value: 90
  }]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ { tag: 'position', x: 0, y: 0 },\n  { tag: 'angle', value: 90 },\n  { tag: 'penup' },\n  { tag: 'pendown' },\n  { tag: 'speed', value: 2 },\n  { tag: 'eraser' },\n  { tag: 'position', x: 0, y: 0 },\n  { tag: 'angle', value: 90 },\n  { tag: 'clear' },\n  { tag: 'position', x: 0, y: 0 },\n  { tag: 'angle', value: 90 } ]" + "\n     Input:  ['penup();pendown();speed(2);eraser();home();clear();']");
  }
});

test("forward(5);speed(2);  forward(1);  back(2);  back(5);", function () {
  var result = suites.ext.apply(null, ['forward(5);speed(2);  forward(1);  back(2);  back(5);']);
  var pass = _.isEqual(result, [{
    tag: 'position',
    x: 0,
    y: 0
  }, {
    tag: 'angle',
    value: 90
  }, {
    tag: 'position',
    x: 0,
    y: 5
  }, {
    tag: 'speed',
    value: 2
  }, {
    tag: 'position',
    x: 0,
    y: 6
  }, {
    tag: 'position',
    x: 0,
    y: 4
  }, {
    tag: 'position',
    x: 0,
    y: -1
  }]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ { tag: 'position', x: 0, y: 0 },\n  { tag: 'angle', value: 90 },\n  { tag: 'position', x: 0, y: 5 },\n  { tag: 'speed', value: 2 },\n  { tag: 'position', x: 0, y: 6 },\n  { tag: 'position', x: 0, y: 4 },\n  { tag: 'position', x: 0, y: -1 } ]" + "\n     Input:  ['forward(5);speed(2);forward(1);back(2);back(5);']");
  }
});

test(" forward(1);  back(2);", function () {
  var result = suites.ext.apply(null, [' forward(1);  back(2);']);
  var pass = _.isEqual(result, [{
    tag: 'position',
    x: 0,
    y: 0
  }, {
    tag: 'angle',
    value: 90
  }, {
    tag: 'position',
    x: 0,
    y: 1
  }, {
    tag: 'position',
    x: 0,
    y: -1
  }]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ { tag: 'position', x: 0, y: 0 },\n  { tag: 'angle', value: 90 },\n  { tag: 'position', x: 0, y: 1 },\n  { tag: 'position', x: 0, y: -1 } ]" + "\n     Input:  ['forward(1);back(2);']");
  }
});

test(" back(2);", function () {
  var result = suites.ext.apply(null, [' back(2);']);
  var pass = _.isEqual(result, [{
    tag: 'position',
    x: 0,
    y: 0
  }, {
    tag: 'angle',
    value: 90
  }, {
    tag: 'position',
    x: 0,
    y: -2
  }]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ { tag: 'position', x: 0, y: 0 },\n  { tag: 'angle', value: 90 },\n  { tag: 'position', x: 0, y: -2 } ]" + "\n     Input:  ['back(2);']");
  }
});