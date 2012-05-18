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

//----
module.exports.suites = {
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
};


var data = {
  add: {
    '3 +2;': {
      inp: ['3 +2;'],
      out: 5
    },
    '3 +2 - 5;': {
      inp: ['3 +2 - 5;'],
      out: 0
    }
  },
  arith: {
    '3*4 +2;': {
      inp: ['3*4 +2;'],
      out: 14
    },
    '3 < 2;': {
      inp: ['3 < 2;'],
      out: false
    },
    '3 < 2 + 5;': {
      inp: ['3 < 2 + 5;'],
      out: true
    },
    '3 * 2 < 2 + 5;': {
      inp: ['3 * 2 < 2 + 5;'],
      out: true
    },
    '-3 * 2 < 2 - 5;': {
      inp: ['-3 * 2 < 2 - 5;'],
      out: true
    },
    '-3 * 2 < 2 - -5;': {
      inp: ['-3 * 2 < 2 - -5;'],
      out: true
    },
    '-3 * 2 < 2 - - -5;': {
      inp: ['-3 * 2 < 2 - - -5;'],
      out: ['error', 'SyntaxError: [0-9]']
    }
  },
  stat: {
    'repeat (30) { 2 + 2; }': {
      inp: ['repeat (30) { 2 + 2; }'],
      out: 4
    },
    'f(5);': {
      inp: ['f(5);'],
      out: ['error', 'Lookup: no such var f']
    },
    'var size;': {
      inp: ['var size;'],
      out: undefined
    },
    'size := 5;': {
      inp: ['size := 5;'],
      out: ['error', 'Assignment: no such var size']
    },
    'f();': {
      inp: ['f();'],
      out: ['error', 'Lookup: no such var f']
    },
    'f(3, g(1));': {
      inp: ['f(3, g(1));'],
      out: ['error', 'Lookup: no such var f']
    }
  },
  if :{
    'if(3<4){2+3;}': {
      inp: ['if(3<4){2+3;}'],
      out: 5
    },
    'if(3>4){2+3;}': {
      inp: ['if(3>4){2+3;}'],
      out: undefined
    }
  },
  var: {
    'var test; test := 5 +3; test;': {
      inp: ['var test; test := 5 +3; test;'],
      out: 8
    }
  }, 
  repeat: {
    'var x; repeat(10) { x := x+1; } x;': {
      inp: ['var x; repeat(10) { x := x+1; } x;'],
      out: 10
    }
  }, 
  fun: {
    'define id (x) {x;} id(3);': {
      inp: ['define id (x) {x;} id(3);'],
      out: 3
    },
    'define f (n) {n + 5;} f(3);': {
      inp: ['define f (n) {n + 5;} f(3);'],
      out: 8
    },
    'define fac (n) {if (n <= 1) {1;} if (n> 1) {n*fac(n-1);}} fac(3);': {
      inp: ['define fac (n) {if (n <= 1) {1;} if (n> 1) {n*fac(n-1);}} fac(3);'],
      out: 6
    },
    'define f (x, y) {x;} f(3, 4);': {
      inp: ['define f (x, y) {x;} f(3, 4);'],
      out: 3
    }
  } 
};


module.exports.data = data;