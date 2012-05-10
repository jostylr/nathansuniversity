/*globals module, require, console, exports*/

var _ = require('underscore');

var runT = require('../run');

//----
module.exports.suites = {
  add: function () {
    return runT.apply(null, arguments);
  },
  arith: function () {
    return runT.apply(null, arguments);
  }
};


var data = {
  add: {
    zero: {
      inp: ['(+)'],
      out: ['error', 'insufficient arguments +']
    },
    one: {
      inp: ['(+ 2)'],
      out: 2
    },
    two: {
      inp: ['(+ 3 4)'],
      out: 7
    },
    three: {
      inp: ['(+ 3 4 5)'],
      out: 12
    },
    four: {
      inp: ['(+ 3 4 5 6)'],
      out: 18
    }
  },
  arith: {
    '(- 3 4)': {
      inp: ['(- 3 4)'],
      out: -1
    },
    '(* 5 6)': {
      inp: ['(* 5 6)'],
      out: 30
    },
    '(/ 8 4)': {
      inp: ['(/ 8 4)'],
      out: 2
    },
    '(^ 2 3)': {
      inp: ['(^ 2 3)'],
      out: 8
    },
    '(% 8 4)': {
      inp: ['(% 8 4)'],
      out: 0
    },
    '(% 3 4)': {
      inp: ['(% 3 4)'],
      out: 3
    }
  }
};


module.exports.data = data;