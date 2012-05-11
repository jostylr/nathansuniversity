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
  },
  begin: function () {
    return runT.apply(null, arguments);
  },
  quote: function () {
    return runT.apply({
      debugS: 3
    }, arguments);
  },
  lambda: function () {
    return runT.apply(null, arguments);
  },
  ifel: function () {
    return runT.apply(null, arguments);
  },
  def: function () {
    return runT.apply(null, arguments);
  },
  let: function () {
    return runT.apply(null, arguments);
  },
  inequality: function () {
    return runT.apply(null, arguments);
  },
  recursion: function () {
    return runT.apply(null, arguments);
  },
  equality: function () {
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
  },
  quote: {
    '\'(1 2 3)': {
      inp: ['\'(1 2 3)'],
      out: [1, 2, 3]
    },
    '\'atom': {
      inp: ['\'atom'],
      out: 'atom'
    }
  },
  inequality: {
    '(< 2 3)': {
      inp: ['(< 2 3)'],
      out: '#t'
    },
    '(< 2 3 4)': {
      inp: ['(< 2 3 4)'],
      out: '#t'
    },
    '(< 2 5 4)': {
      inp: ['(< 2 5 4)'],
      out: '#f'
    },
    '(< 2)': {
      inp: ['(< 2)'],
      out: ['error', 'insufficient arguments +']
    }
  },
  equality: {
    '(= 1 0)': {
      inp: ['(= 1 0)'],
      out: '#f'
    },
    '(= 1 1)': {
      inp: ['(= 1 1)'],
      out: '#t'
    }
  },
  recursion: {
    '(define factorial (lambda (n) (if (= n 0) 1 (* n (factorial (- n 1)))))) (factorial 3)': {
      inp: ['(define factorial (lambda (n) (if (= n 0) 1 (* n (factorial (- n 1)))))) (factorial 3)'],
      out: [6]
    },
    '(define factorial (lambda (n) (if (= n 0) 1 (* n (factorial (- n 1)))))) (factorial 5)': {
      inp: ['(define factorial (lambda (n) (if (= n 0) 1 (* n (factorial (- n 1)))))) (factorial 5)'],
      out: [120]
    }
  }
};


module.exports.data = data;