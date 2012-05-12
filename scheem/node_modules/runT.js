/*globals module, require, console, exports*/

var _ = require('underscore');

var runT = require('run');

var suites = {
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

_ = require("underscore");

util = require("util");

suite("add");

test("zero", function () {
  var flag = true;
  try {
    suites.add.apply(null, ['(+)']);
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
  var result = suites.add.apply(null, ['(+ 2)']);
  var pass = _.isEqual(result, 2);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "2" + "\n     Input:  ['(+2)']");
  }
});

test("two", function () {
  var result = suites.add.apply(null, ['(+ 3 4)']);
  var pass = _.isEqual(result, 7);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "7" + "\n     Input:  ['(+34)']");
  }
});

test("three", function () {
  var result = suites.add.apply(null, ['(+ 3 4 5)']);
  var pass = _.isEqual(result, 12);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "12" + "\n     Input:  ['(+345)']");
  }
});

test("four", function () {
  var result = suites.add.apply(null, ['(+ 3 4 5 6)']);
  var pass = _.isEqual(result, 18);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "18" + "\n     Input:  ['(+3456)']");
  }
});

suite("arith");

test("(- 3 4)", function () {
  var result = suites.arith.apply(null, ['(- 3 4)']);
  var pass = _.isEqual(result, -1);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "-1" + "\n     Input:  ['(-34)']");
  }
});

test("(* 5 6)", function () {
  var result = suites.arith.apply(null, ['(* 5 6)']);
  var pass = _.isEqual(result, 30);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "30" + "\n     Input:  ['(*56)']");
  }
});

test("(/ 8 4)", function () {
  var result = suites.arith.apply(null, ['(/ 8 4)']);
  var pass = _.isEqual(result, 2);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "2" + "\n     Input:  ['(/84)']");
  }
});

test("(^ 2 3)", function () {
  var result = suites.arith.apply(null, ['(^ 2 3)']);
  var pass = _.isEqual(result, 8);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "8" + "\n     Input:  ['(^23)']");
  }
});

test("(% 8 4)", function () {
  var result = suites.arith.apply(null, ['(% 8 4)']);
  var pass = _.isEqual(result, 0);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "0" + "\n     Input:  ['(%84)']");
  }
});

test("(% 3 4)", function () {
  var result = suites.arith.apply(null, ['(% 3 4)']);
  var pass = _.isEqual(result, 3);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "3" + "\n     Input:  ['(%34)']");
  }
});

suite("quote");

test("'(1 2 3)", function () {
  var result = suites.quote.apply(null, ['\'(1 2 3)']);
  var pass = _.isEqual(result, [1, 2, 3]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ 1, 2, 3 ]" + "\n     Input:  ['\'(123)']");
  }
});

test("'atom", function () {
  var result = suites.quote.apply(null, ['\'atom']);
  var pass = _.isEqual(result, 'atom');
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "'atom'" + "\n     Input:  ['\'atom']");
  }
});

suite("inequality");

test("(< 2 3)", function () {
  var result = suites.inequality.apply(null, ['(< 2 3)']);
  var pass = _.isEqual(result, '#t');
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "'#t'" + "\n     Input:  ['(<23)']");
  }
});

test("(< 2 3 4)", function () {
  var result = suites.inequality.apply(null, ['(< 2 3 4)']);
  var pass = _.isEqual(result, '#t');
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "'#t'" + "\n     Input:  ['(<234)']");
  }
});

test("(< 2 5 4)", function () {
  var result = suites.inequality.apply(null, ['(< 2 5 4)']);
  var pass = _.isEqual(result, '#f');
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "'#f'" + "\n     Input:  ['(<254)']");
  }
});

test("(< 2)", function () {
  var flag = true;
  try {
    suites.inequality.apply(null, ['(< 2)']);
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

test("(> 3 4)", function () {
  var result = suites.inequality.apply(null, ['(> 3 4)']);
  var pass = _.isEqual(result, '#f');
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "'#f'" + "\n     Input:  ['(>34)']");
  }
});

test("(> 4 3)", function () {
  var result = suites.inequality.apply(null, ['(> 4 3)']);
  var pass = _.isEqual(result, '#t');
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "'#t'" + "\n     Input:  ['(>43)']");
  }
});

test("(> 4 4)", function () {
  var result = suites.inequality.apply(null, ['(> 4 4)']);
  var pass = _.isEqual(result, '#f');
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "'#f'" + "\n     Input:  ['(>44)']");
  }
});

test("(>= 3 4)", function () {
  var result = suites.inequality.apply(null, ['(>= 3 4)']);
  var pass = _.isEqual(result, '#f');
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "'#f'" + "\n     Input:  ['(>=34)']");
  }
});

test("(>= 4 3)", function () {
  var result = suites.inequality.apply(null, ['(>= 4 3)']);
  var pass = _.isEqual(result, '#t');
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "'#t'" + "\n     Input:  ['(>=43)']");
  }
});

test("(>= 4 4)", function () {
  var result = suites.inequality.apply(null, ['(>= 4 4)']);
  var pass = _.isEqual(result, '#t');
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "'#t'" + "\n     Input:  ['(>=44)']");
  }
});

test("(<= 3 4)", function () {
  var result = suites.inequality.apply(null, ['(<= 3 4)']);
  var pass = _.isEqual(result, '#t');
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "'#t'" + "\n     Input:  ['(<=34)']");
  }
});

test("(<= 4 3)", function () {
  var result = suites.inequality.apply(null, ['(<= 4 3)']);
  var pass = _.isEqual(result, '#f');
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "'#f'" + "\n     Input:  ['(<=43)']");
  }
});

test("(<= 4 4)", function () {
  var result = suites.inequality.apply(null, ['(<= 4 4)']);
  var pass = _.isEqual(result, '#t');
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "'#t'" + "\n     Input:  ['(<=44)']");
  }
});

test("(= 3 4)", function () {
  var result = suites.inequality.apply(null, ['(= 3 4)']);
  var pass = _.isEqual(result, '#f');
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "'#f'" + "\n     Input:  ['(=34)']");
  }
});

test("(= 4 3)", function () {
  var result = suites.inequality.apply(null, ['(= 4 3)']);
  var pass = _.isEqual(result, '#f');
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "'#f'" + "\n     Input:  ['(=43)']");
  }
});

test("(= 4 4)", function () {
  var result = suites.inequality.apply(null, ['(= 4 4)']);
  var pass = _.isEqual(result, '#t');
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "'#t'" + "\n     Input:  ['(=44)']");
  }
});

test("(!= 3 4)", function () {
  var result = suites.inequality.apply(null, ['(!= 3 4)']);
  var pass = _.isEqual(result, '#t');
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "'#t'" + "\n     Input:  ['(!=34)']");
  }
});

test("(!= 4 3)", function () {
  var result = suites.inequality.apply(null, ['(!= 4 3)']);
  var pass = _.isEqual(result, '#t');
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "'#t'" + "\n     Input:  ['(!=43)']");
  }
});

test("(!= 4 4)", function () {
  var result = suites.inequality.apply(null, ['(!= 4 4)']);
  var pass = _.isEqual(result, '#f');
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "'#f'" + "\n     Input:  ['(!=44)']");
  }
});

suite("equality");

test("(= 1 0)", function () {
  var result = suites.equality.apply(null, ['(= 1 0)']);
  var pass = _.isEqual(result, '#f');
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "'#f'" + "\n     Input:  ['(=10)']");
  }
});

test("(= 1 1)", function () {
  var result = suites.equality.apply(null, ['(= 1 1)']);
  var pass = _.isEqual(result, '#t');
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "'#t'" + "\n     Input:  ['(=11)']");
  }
});

suite("recursion");

test("(define factorial (lambda (n) (if (= n 0) 1 (* n (factorial (- n 1)))))) (factorial 3)", function () {
  var result = suites.recursion.apply(null, ['(define factorial (lambda (n) (if (= n 0) 1 (* n (factorial (- n 1)))))) (factorial 3)']);
  var pass = _.isEqual(result, [6]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ 6 ]" + "\n     Input:  ['(definefactorial(lambda(n)(if(=n0)1(*n(factorial(-n1))))))(factorial3)']");
  }
});

test("(define factorial (lambda (n) (if (= n 0) 1 (* n (factorial (- n 1)))))) (factorial 5)", function () {
  var result = suites.recursion.apply(null, ['(define factorial (lambda (n) (if (= n 0) 1 (* n (factorial (- n 1)))))) (factorial 5)']);
  var pass = _.isEqual(result, [120]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ 120 ]" + "\n     Input:  ['(definefactorial(lambda(n)(if(=n0)1(*n(factorial(-n1))))))(factorial5)']");
  }
});

suite("cons");

test("(cons 1 '(2 3))", function () {
  var result = suites.cons.apply(null, ['(cons 1 \'(2 3))']);
  var pass = _.isEqual(result, [1, 2, 3]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ 1, 2, 3 ]" + "\n     Input:  ['(cons1\'(23))']");
  }
});

test("(cdr '(1 2 3))", function () {
  var result = suites.cons.apply(null, ['(cdr \'(1 2 3))']);
  var pass = _.isEqual(result, 1);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "1" + "\n     Input:  ['(cdr\'(123))']");
  }
});

test("(cdr '(5 2 3))", function () {
  var result = suites.cons.apply(null, ['(cdr \'(5 2 3))']);
  var pass = _.isEqual(result, 5);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "5" + "\n     Input:  ['(cdr\'(523))']");
  }
});

test("(car '(1 2 3))", function () {
  var result = suites.cons.apply(null, ['(car \'(1 2 3))']);
  var pass = _.isEqual(result, [2, 3]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ 2, 3 ]" + "\n     Input:  ['(car\'(123))']");
  }
});

suite("ifel");

test("(define x 3) (let x 2 (* x 4)) x", function () {
  var result = suites.ifel.apply(null, ['(define x 3) (let x 2 (* x 4)) x']);
  var pass = _.isEqual(result, 3);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "3" + "\n     Input:  ['(definex3)(letx2(*x4))x']");
  }
});

test("(define x 3) (let x 2 (* x 4))", function () {
  var result = suites.ifel.apply(null, ['(define x 3) (let x 2 (* x 4))']);
  var pass = _.isEqual(result, 8);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "8" + "\n     Input:  ['(definex3)(letx2(*x4))']");
  }
});

suite("def");

test("(define x 3) (set! x 5) x", function () {
  var result = suites.def.apply(null, ['(define x 3) (set! x 5) x']);
  var pass = _.isEqual(result, 5);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "5" + "\n     Input:  ['(definex3)(set!x5)x']");
  }
});

test("(define x 3) (set! y 5) x", function () {
  var flag = true;
  try {
    suites.def.apply(null, ['(define x 3) (set! y 5) x']);
  }
  catch (e) {
    flag = false;
    if (!_.isEqual(e.toString(), "variable not yet  defined: y")) {
      throw new Error("wrong error", e);
    }
  }
  if (flag) {
    throw new Error("failed to throw error");
  }
});

test("(define x 3) (define x 5) x", function () {
  var flag = true;
  try {
    suites.def.apply(null, ['(define x 3) (define x 5) x']);
  }
  catch (e) {
    flag = false;
    if (!_.isEqual(e.toString(), "variable already defined: x")) {
      throw new Error("wrong error", e);
    }
  }
  if (flag) {
    throw new Error("failed to throw error");
  }
});

suite("hash");

test("(# x 4 y 6)", function () {
  var result = suites.hash.apply(null, ['(# x 4 y 6)']);
  var pass = _.isEqual(result, {
    y: 6,
    x: 4
  });
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "{ y: 6, x: 4 }" + "\n     Input:  ['(#x4y6)']");
  }
});

test("(. (# x 4 y 6) 'y)", function () {
  var result = suites.hash.apply(null, ['(. (# x 4 y 6) \'y)']);
  var pass = _.isEqual(result, 6);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "6" + "\n     Input:  ['(.(#x4y6)\'y)']");
  }
});

test("(define x (# y 3 z (lambda (n) (+ (. this 'y) n)))) ((. x 'z) 5)", function () {
  var result = suites.hash.apply(null, ['(define x (# y 3 z (lambda (n) (+ (. this \'y) n)))) ((. x \'z) 5)']);
  var pass = _.isEqual(result, [8]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ 8 ]" + "\n     Input:  ['(definex(#y3z(lambda(n)(+(.this\'y)n))))((.x\'z)5)']");
  }
});

test("(define x (# y 3 z (lambda (+ (. this 'y) (cdr arguments))))) ((. x 'z) 5)", function () {
  var result = suites.hash.apply(null, ['(define x (# y 3 z (lambda (+ (. this \'y) (cdr arguments))))) ((. x \'z) 5)']);
  var pass = _.isEqual(result, [8]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ 8 ]" + "\n     Input:  ['(definex(#y3z(lambda(+(.this\'y)(cdrarguments)))))((.x\'z)5)']");
  }
});