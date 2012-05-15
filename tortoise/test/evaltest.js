/*globals module, require, console, exports*/

var fs = require('fs');

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
      throw e;
    }
  };

var suites = {
  add: function () {
    return run.apply(null, arguments);
  },
  arith: function () {
    return run.apply(null, arguments);
  },
  stat: function () {
    return parser.apply(null, arguments);
  },
  if :function () {
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
  var pass = _.isEqual(result, {
    tag: 'statements',
    body: [{
      tag: 'op',
      type: '<',
      left: 3,
      right: {
        tag: 'op',
        type: '+',
        left: 2,
        right: 5
      }
    }]
  });
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "{ tag: 'statements',\n  body: \n   [ { tag: 'op',\n       type: '<',\n       left: 3,\n       right: { tag: 'op', type: '+', left: 2, right: 5 } } ] }" + "\n     Input:  ['3<2+5;']");
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
    if (!_.isEqual(e.toString(), "SyntaxError: [0-9]")) {
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
  var pass = _.isEqual(result, {
    tag: 'statements',
    body: [{
      tag: 'repeat',
      n: 30,
      body: [{
        tag: 'op',
        type: '+',
        left: 2,
        right: 2
      }]
    }]
  });
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "{ tag: 'statements',\n  body: \n   [ { tag: 'repeat',\n       n: 30,\n       body: [ { tag: 'op', type: '+', left: 2, right: 2 } ] } ] }" + "\n     Input:  ['repeat(30){2+2;}']");
  }
});

test("f(5);", function () {
  var result = suites.stat.apply(null, ['f(5);']);
  var pass = _.isEqual(result, {
    tag: 'statements',
    body: [{
      tag: 'call',
      name: 'f',
      args: [5]
    }]
  });
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "{ tag: 'statements',\n  body: [ { tag: 'call', name: 'f', args: [ 5 ] } ] }" + "\n     Input:  ['f(5);']");
  }
});

test("var size;", function () {
  var result = suites.stat.apply(null, ['var size;']);
  var pass = _.isEqual(result, {
    tag: 'statements',
    body: [{
      tag: 'var',
      name: 'size'
    }]
  });
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "{ tag: 'statements', body: [ { tag: 'var', name: 'size' } ] }" + "\n     Input:  ['varsize;']");
  }
});

test("size := 5;", function () {
  var result = suites.stat.apply(null, ['size := 5;']);
  var pass = _.isEqual(result, {
    tag: 'statements',
    body: [{
      tag: 'assignment',
      name: 'size',
      value: 5
    }]
  });
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "{ tag: 'statements',\n  body: [ { tag: 'assignment', name: 'size', value: 5 } ] }" + "\n     Input:  ['size:=5;']");
  }
});

test("repeat(18) {right(20);repeat(36) {forward(20);right(10);}}", function () {
  var result = suites.stat.apply(null, ['repeat(18) {right(20);repeat(36) {forward(20);right(10);}}']);
  var pass = _.isEqual(result, {
    tag: 'statements',
    body: [{
      tag: 'repeat',
      n: 18,
      body: [{
        tag: 'call',
        name: 'right',
        args: [20]
      }, {
        tag: 'repeat',
        n: 36,
        body: [{
          tag: 'call',
          name: 'forward',
          args: [20]
        }, {
          tag: 'call',
          name: 'right',
          args: [10]
        }]
      }]
    }]
  });
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "{ tag: 'statements',\n  body: \n   [ { tag: 'repeat',\n       n: 18,\n       body: \n        [ { tag: 'call', name: 'right', args: [ 20 ] },\n          { tag: 'repeat',\n            n: 36,\n            body: \n             [ { tag: 'call', name: 'forward', args: [ 20 ] },\n               { tag: 'call', name: 'right', args: [ 10 ] } ] } ] } ] }" + "\n     Input:  ['repeat(18){right(20);repeat(36){forward(20);right(10);}}']");
  }
});

test("f();", function () {
  var result = suites.stat.apply(null, ['f();']);
  var pass = _.isEqual(result, {
    tag: 'statements',
    body: [{
      tag: 'call',
      name: 'f',
      args: []
    }]
  });
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "{ tag: 'statements',\n  body: [ { tag: 'call', name: 'f', args: [] } ] }" + "\n     Input:  ['f();']");
  }
});

test("define spiral(size) {    if (size < 30) {        forward(size);        right(15);        var newsize;        newsize := size * 1.02;        spiral(newsize);    }}spiral(5);", function () {
  var result = suites.stat.apply(null, ['define spiral(size) {    if (size < 30) {        forward(size);        right(15);        var newsize;        newsize := size * 1.02;        spiral(newsize);    }}spiral(5);']);
  var pass = _.isEqual(result, {
    tag: 'statements',
    body: [{
      tag: 'define',
      name: 'spiral',
      args: ['size'],
      body: [{
        tag: 'if',
        cond: {
          tag: 'op',
          type: '<',
          left: {
            tag: 'identifier',
            value: 'size'
          },
          right: 30
        },
        body: [{
          tag: 'call',
          name: 'forward',
          args: [{
            tag: 'identifier',
            value: 'size'
          }]
        }, {
          tag: 'call',
          name: 'right',
          args: [15]
        }, {
          tag: 'var',
          name: 'newsize'
        }, {
          tag: 'assignment',
          name: 'newsize',
          value: {
            tag: 'op',
            type: '*',
            left: {
              tag: 'identifier',
              value: 'size'
            },
            right: 1.02
          }
        }, {
          tag: 'call',
          name: 'spiral',
          args: [{
            tag: 'identifier',
            value: 'newsize'
          }]
        }]
      }]
    }, {
      tag: 'call',
      name: 'spiral',
      args: [5]
    }]
  });
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "{ tag: 'statements',\n  body: \n   [ { tag: 'define',\n       name: 'spiral',\n       args: [ 'size' ],\n       body: \n        [ { tag: 'if',\n            cond: \n             { tag: 'op',\n               type: '<',\n               left: { tag: 'identifier', value: 'size' },\n               right: 30 },\n            body: \n             [ { tag: 'call',\n                 name: 'forward',\n                 args: [ { tag: 'identifier', value: 'size' } ] },\n               { tag: 'call', name: 'right', args: [ 15 ] },\n               { tag: 'var', name: 'newsize' },\n               { tag: 'assignment',\n                 name: 'newsize',\n                 value: \n                  { tag: 'op',\n                    type: '*',\n                    left: { tag: 'identifier', value: 'size' },\n                    right: 1.02 } },\n               { tag: 'call',\n                 name: 'spiral',\n                 args: [ { tag: 'identifier', value: 'newsize' } ] } ] } ] },\n     { tag: 'call', name: 'spiral', args: [ 5 ] } ] }" + "\n     Input:  ['definespiral(size){if(size<30){forward(size);right(15);varnewsize;newsize:=size*1.02;spiral(newsize);}}spiral(5);']");
  }
});

test("define square(x) {repeat(4) {forward(x);right(90);    }}square(100);square(20);", function () {
  var result = suites.stat.apply(null, ['define square(x) {repeat(4) {forward(x);right(90);    }}square(100);square(20);']);
  var pass = _.isEqual(result, {
    tag: 'statements',
    body: [{
      tag: 'define',
      name: 'square',
      args: ['x'],
      body: [{
        tag: 'repeat',
        n: 4,
        body: [{
          tag: 'call',
          name: 'forward',
          args: [{
            tag: 'identifier',
            value: 'x'
          }]
        }, {
          tag: 'call',
          name: 'right',
          args: [90]
        }]
      }]
    }, {
      tag: 'call',
      name: 'square',
      args: [100]
    }, {
      tag: 'call',
      name: 'square',
      args: [20]
    }]
  });
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "{ tag: 'statements',\n  body: \n   [ { tag: 'define',\n       name: 'square',\n       args: [ 'x' ],\n       body: \n        [ { tag: 'repeat',\n            n: 4,\n            body: \n             [ { tag: 'call',\n                 name: 'forward',\n                 args: [ { tag: 'identifier', value: 'x' } ] },\n               { tag: 'call', name: 'right', args: [ 90 ] } ] } ] },\n     { tag: 'call', name: 'square', args: [ 100 ] },\n     { tag: 'call', name: 'square', args: [ 20 ] } ] }" + "\n     Input:  ['definesquare(x){repeat(4){forward(x);right(90);}}square(100);square(20);']");
  }
});

test("f()", function () {
  var flag = true;
  try {
    suites.stat.apply(null, ['f()']);
  }
  catch (e) {
    flag = false;
    if (!_.isEqual(e.toString(), "SyntaxError: " != "," * "," + "," - "," / ",";
    "," < "," <= "," == "," > "," >= ",[ \n\r\t]")) {
      throw new Error("wrong error", e);
    }
  }
  if (flag) {
    throw new Error("failed to throw error");
  }
});

test("f(3, g(1));", function () {
  var result = suites.stat.apply(null, ['f(3, g(1));']);
  var pass = _.isEqual(result, [{
    tag: 'call',
    name: 'f',
    args: [3,
    {
      tag: 'call',
      name: 'g',
      args: [1]
    }]
  }]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ { tag: 'call',\n    name: 'f',\n    args: [ 3, { tag: 'call', name: 'g', args: [ 1 ] } ] } ]" + "\n     Input:  ['f(3,g(1));']");
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