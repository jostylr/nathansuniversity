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
  },
  cons: function () {
    return runT.apply(null, arguments);
  },
  hash: function () {
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
  },
  cons: {
    '(cons 1 \'(2 3))': {
      inp: ['(cons 1 \'(2 3))'],
      out: [1, 2, 3]
    },
    '(cdr \'(1 2 3))': {
      inp: ['(cdr \'(1 2 3))'],
      out: 1
    },
    '(cdr \'(5 2 3))': {
      inp: ['(cdr \'(5 2 3))'],
      out: 5
    },
    '(car \'(1 2 3))': {
      inp: ['(car \'(1 2 3))'],
      out: [2, 3]
    }
  },
  ifel: {
    '(define x 3) (let x 2 (* x 4)) x': {
      inp: ['(define x 3) (let x 2 (* x 4)) x'],
      out: 3
    },
    '(define x 3) (let x 2 (* x 4))': {
      inp: ['(define x 3) (let x 2 (* x 4))'],
      out: 8
    }
  },
  def: {
    '(define x 3) (set! x 5) x': {
      inp: ['(define x 3) (set! x 5) x'],
      out: 5
    },
    '(define x 3) (set! y 5) x': {
      inp: ['(define x 3) (set! y 5) x'],
      out: ['error', 'variable not yet  defined: y']
    },
    '(define x 3) (define x 5) x': {
      inp: ['(define x 3) (define x 5) x'],
      out: ['error', 'variable already defined: x']
    }
  },
  hash: {
    '(# x 4 y 6)': {
      inp: ['(# x 4 y 6)'],
      out: {
        y: 6,
        x: 4
      }
    },
    '(. (# x 4 y 6) \'y)': {
      inp: ['(. (# x 4 y 6) \'y)'],
      out: 6
    },
    '(define x (# y 3 z (lambda (n) (+ (. this \'y) n)))) ((. x \'z) 5)': {
      inp: ['(define x (# y 3 z (lambda (n) (+ (. this \'y) n)))) ((. x \'z) 5)'],
      out: [8]
    },
    '(define x (# y 3 z (lambda (+ (. this \'y) (cdr arguments))))) ((. x \'z) 5)': {
      inp: ['(define x (# y 3 z (lambda (+ (. this \'y) (cdr arguments))))) ((. x \'z) 5)'],
      out: [8]
    }
  }
};


module.exports.data = data;