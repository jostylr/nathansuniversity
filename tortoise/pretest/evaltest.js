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
  'ext': function () {
    return run.apply(null, arguments);
  }
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
    'repeat(2) {right(20);repeat(3) {forward(20);right(10);}}': {
      inp: ['repeat(2) {right(20);repeat(3) {forward(20);right(10);}}'],
      out: [{
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
      }]
    },
    'f();': {
      inp: ['f();'],
      out: ['error', 'Lookup: no such var f']
    },
    'define spiral(size) {    if (size < 30) {        forward(size);        right(15);        var newsize;        newsize := size * 1.02;        spiral(newsize);    }}spiral(5);': {
      inp: ['define spiral(size) {    if (size < 30) {        forward(size);        right(15);        var newsize;        newsize := size * 1.02;        spiral(newsize);    }}spiral(5);'],
      out: [{
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
      }]
    },
    'define square(x) {repeat(4) {forward(x);right(90);    }}square(100);square(20);': {
      inp: ['define square(x) {repeat(4) {forward(x);right(90);    }}square(100);square(20);'],
      out: [{
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
      }]
    },
    'f()': {
      inp: ['f()'],
      out: ['error', 'SyntaxError: "!=","*","+","-","/",";","<","<=","==",">",">=",[ \\n\\r\\t]']
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
  }, repeat: {
    'var x; repeat(10) { x := x+1; } x;': {
      inp: ['var x; repeat(10) { x := x+1; } x;'],
      out: 10
    }
  }, fun: {
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
    }
  }, ext: {
    'forward(3);': {
      inp: ['forward(3);'],
      out: [{
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
      }]
    },
    'forward(3); left(45); back(7); right(45);': {
      inp: ['forward(3); left(45); back(7); right(45);'],
      out: [{
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
      }]
    },
    'penup(); right(30); forward(5); pendown(); speed(2); left(60); forward(1); eraser(); back(2); home(); back(5); clear();': {
      inp: ['penup(); right(30); forward(5); pendown(); speed(2); left(60); forward(1); eraser(); back(2); home(); back(5); clear();'],
      out: [{
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
      }]
    },
    'penup(); forward(5); pendown(); speed(2);  forward(1); eraser(); back(2); home(); back(5); clear();': {
      inp: ['penup(); forward(5); pendown(); speed(2);  forward(1); eraser(); back(2); home(); back(5); clear();'],
      out: [{
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
      }]
    },
    'penup(); pendown(); speed(2); eraser(); home(); clear();': {
      inp: ['penup(); pendown(); speed(2); eraser(); home(); clear();'],
      out: [{
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
      }]
    },
    'forward(5);speed(2);  forward(1);  back(2);  back(5);': {
      inp: ['forward(5);speed(2);  forward(1);  back(2);  back(5);'],
      out: [{
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
      }]
    },
    ' forward(1);  back(2);': {
      inp: [' forward(1);  back(2);'],
      out: [{
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
      }]
    },
    ' back(2);': {
      inp: [' back(2);'],
      out: [{
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
      }]
    }
  }
};


module.exports.data = data;