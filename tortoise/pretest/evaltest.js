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
        value: [0, 0]
      }, {
        tag: 'angle',
        value: 90
      }, {
        tag: 'angle',
        value: 70
      }, {
        tag: 'position',
        value: [7, 19]
      }, {
        tag: 'angle',
        value: 60
      }, {
        tag: 'position',
        value: [17, 36]
      }, {
        tag: 'angle',
        value: 50
      }, {
        tag: 'position',
        value: [30, 51]
      }, {
        tag: 'angle',
        value: 40
      }, {
        tag: 'angle',
        value: 20
      }, {
        tag: 'position',
        value: [49, 58]
      }, {
        tag: 'angle',
        value: 10
      }, {
        tag: 'position',
        value: [69, 61]
      }, {
        tag: 'angle',
        value: 0
      }, {
        tag: 'position',
        value: [89, 61]
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
        value: [0, 0]
      }, {
        tag: 'angle',
        value: 90
      }, {
        tag: 'position',
        value: [0, 5]
      }, {
        tag: 'angle',
        value: 75
      }, {
        tag: 'position',
        value: [1, 10]
      }, {
        tag: 'angle',
        value: 60
      }, {
        tag: 'position',
        value: [4, 15]
      }, {
        tag: 'angle',
        value: 45
      }, {
        tag: 'position',
        value: [8, 19]
      }, {
        tag: 'angle',
        value: 30
      }, {
        tag: 'position',
        value: [13, 22]
      }, {
        tag: 'angle',
        value: 15
      }, {
        tag: 'position',
        value: [18, 23]
      }, {
        tag: 'angle',
        value: 0
      }, {
        tag: 'position',
        value: [24, 23]
      }, {
        tag: 'angle',
        value: -15
      }, {
        tag: 'position',
        value: [30, 22]
      }, {
        tag: 'angle',
        value: -30
      }, {
        tag: 'position',
        value: [35, 19]
      }, {
        tag: 'angle',
        value: -45
      }, {
        tag: 'position',
        value: [39, 15]
      }, {
        tag: 'angle',
        value: -60
      }, {
        tag: 'position',
        value: [42, 10]
      }, {
        tag: 'angle',
        value: -75
      }, {
        tag: 'position',
        value: [44, 4]
      }, {
        tag: 'angle',
        value: -90
      }, {
        tag: 'position',
        value: [44, -2]
      }, {
        tag: 'angle',
        value: -105
      }, {
        tag: 'position',
        value: [42, -8]
      }, {
        tag: 'angle',
        value: -120
      }, {
        tag: 'position',
        value: [39, -14]
      }, {
        tag: 'angle',
        value: -135
      }, {
        tag: 'position',
        value: [34, -19]
      }, {
        tag: 'angle',
        value: -150
      }, {
        tag: 'position',
        value: [28, -22]
      }, {
        tag: 'angle',
        value: -165
      }, {
        tag: 'position',
        value: [21, -24]
      }, {
        tag: 'angle',
        value: -180
      }, {
        tag: 'position',
        value: [14, -24]
      }, {
        tag: 'angle',
        value: -195
      }, {
        tag: 'position',
        value: [7, -22]
      }, {
        tag: 'angle',
        value: -210
      }, {
        tag: 'position',
        value: [1, -18]
      }, {
        tag: 'angle',
        value: -225
      }, {
        tag: 'position',
        value: [-4, -13]
      }, {
        tag: 'angle',
        value: -240
      }, {
        tag: 'position',
        value: [-8, -6]
      }, {
        tag: 'angle',
        value: -255
      }, {
        tag: 'position',
        value: [-10, 2]
      }, {
        tag: 'angle',
        value: -270
      }, {
        tag: 'position',
        value: [-10, 10]
      }, {
        tag: 'angle',
        value: -285
      }, {
        tag: 'position',
        value: [-8, 18]
      }, {
        tag: 'angle',
        value: -300
      }, {
        tag: 'position',
        value: [-4, 25]
      }, {
        tag: 'angle',
        value: -315
      }, {
        tag: 'position',
        value: [2, 31]
      }, {
        tag: 'angle',
        value: -330
      }, {
        tag: 'position',
        value: [10, 35]
      }, {
        tag: 'angle',
        value: -345
      }, {
        tag: 'position',
        value: [19, 37]
      }, {
        tag: 'angle',
        value: -360
      }, {
        tag: 'position',
        value: [28, 37]
      }, {
        tag: 'angle',
        value: -375
      }, {
        tag: 'position',
        value: [37, 35]
      }, {
        tag: 'angle',
        value: -390
      }, {
        tag: 'position',
        value: [45, 30]
      }, {
        tag: 'angle',
        value: -405
      }, {
        tag: 'position',
        value: [52, 23]
      }, {
        tag: 'angle',
        value: -420
      }, {
        tag: 'position',
        value: [57, 15]
      }, {
        tag: 'angle',
        value: -435
      }, {
        tag: 'position',
        value: [60, 5]
      }, {
        tag: 'angle',
        value: -450
      }, {
        tag: 'position',
        value: [60, -5]
      }, {
        tag: 'angle',
        value: -465
      }, {
        tag: 'position',
        value: [57, -15]
      }, {
        tag: 'angle',
        value: -480
      }, {
        tag: 'position',
        value: [52, -24]
      }, {
        tag: 'angle',
        value: -495
      }, {
        tag: 'position',
        value: [44, -32]
      }, {
        tag: 'angle',
        value: -510
      }, {
        tag: 'position',
        value: [34, -38]
      }, {
        tag: 'angle',
        value: -525
      }, {
        tag: 'position',
        value: [23, -41]
      }, {
        tag: 'angle',
        value: -540
      }, {
        tag: 'position',
        value: [12, -41]
      }, {
        tag: 'angle',
        value: -555
      }, {
        tag: 'position',
        value: [1, -38]
      }, {
        tag: 'angle',
        value: -570
      }, {
        tag: 'position',
        value: [-9, -32]
      }, {
        tag: 'angle',
        value: -585
      }, {
        tag: 'position',
        value: [-18, -23]
      }, {
        tag: 'angle',
        value: -600
      }, {
        tag: 'position',
        value: [-24, -12]
      }, {
        tag: 'angle',
        value: -615
      }, {
        tag: 'position',
        value: [-27, 0]
      }, {
        tag: 'angle',
        value: -630
      }, {
        tag: 'position',
        value: [-27, 13]
      }, {
        tag: 'angle',
        value: -645
      }, {
        tag: 'position',
        value: [-24, 26]
      }, {
        tag: 'angle',
        value: -660
      }, {
        tag: 'position',
        value: [-17, 38]
      }, {
        tag: 'angle',
        value: -675
      }, {
        tag: 'position',
        value: [-7, 48]
      }, {
        tag: 'angle',
        value: -690
      }, {
        tag: 'position',
        value: [5, 55]
      }, {
        tag: 'angle',
        value: -705
      }, {
        tag: 'position',
        value: [19, 59]
      }, {
        tag: 'angle',
        value: -720
      }, {
        tag: 'position',
        value: [34, 59]
      }, {
        tag: 'angle',
        value: -735
      }, {
        tag: 'position',
        value: [48, 55]
      }, {
        tag: 'angle',
        value: -750
      }, {
        tag: 'position',
        value: [61, 47]
      }, {
        tag: 'angle',
        value: -765
      }, {
        tag: 'position',
        value: [72, 36]
      }, {
        tag: 'angle',
        value: -780
      }, {
        tag: 'position',
        value: [80, 22]
      }, {
        tag: 'angle',
        value: -795
      }, {
        tag: 'position',
        value: [84, 6]
      }, {
        tag: 'angle',
        value: -810
      }, {
        tag: 'position',
        value: [84, -10]
      }, {
        tag: 'angle',
        value: -825
      }, {
        tag: 'position',
        value: [80, -26]
      }, {
        tag: 'angle',
        value: -840
      }, {
        tag: 'position',
        value: [71, -41]
      }, {
        tag: 'angle',
        value: -855
      }, {
        tag: 'position',
        value: [59, -53]
      }, {
        tag: 'angle',
        value: -870
      }, {
        tag: 'position',
        value: [44, -62]
      }, {
        tag: 'angle',
        value: -885
      }, {
        tag: 'position',
        value: [27, -67]
      }, {
        tag: 'angle',
        value: -900
      }, {
        tag: 'position',
        value: [9, -67]
      }, {
        tag: 'angle',
        value: -915
      }, {
        tag: 'position',
        value: [-9, -62]
      }, {
        tag: 'angle',
        value: -930
      }, {
        tag: 'position',
        value: [-26, -52]
      }, {
        tag: 'angle',
        value: -945
      }, {
        tag: 'position',
        value: [-40, -38]
      }, {
        tag: 'angle',
        value: -960
      }, {
        tag: 'position',
        value: [-50, -21]
      }, {
        tag: 'angle',
        value: -975
      }, {
        tag: 'position',
        value: [-55, -1]
      }, {
        tag: 'angle',
        value: -990
      }, {
        tag: 'position',
        value: [-55, 20]
      }, {
        tag: 'angle',
        value: -1005
      }, {
        tag: 'position',
        value: [-50, 40]
      }, {
        tag: 'angle',
        value: -1020
      }, {
        tag: 'position',
        value: [-39, 59]
      }, {
        tag: 'angle',
        value: -1035
      }, {
        tag: 'position',
        value: [-23, 75]
      }, {
        tag: 'angle',
        value: -1050
      }, {
        tag: 'position',
        value: [-3, 86]
      }, {
        tag: 'angle',
        value: -1065
      }, {
        tag: 'position',
        value: [19, 92]
      }, {
        tag: 'angle',
        value: -1080
      }, {
        tag: 'position',
        value: [42, 92]
      }, {
        tag: 'angle',
        value: -1095
      }, {
        tag: 'position',
        value: [65, 86]
      }, {
        tag: 'angle',
        value: -1110
      }, {
        tag: 'position',
        value: [86, 74]
      }, {
        tag: 'angle',
        value: -1125
      }, {
        tag: 'position',
        value: [104, 56]
      }, {
        tag: 'angle',
        value: -1140
      }, {
        tag: 'position',
        value: [117, 34]
      }, {
        tag: 'angle',
        value: -1155
      }, {
        tag: 'position',
        value: [124, 9]
      }, {
        tag: 'angle',
        value: -1170
      }, {
        tag: 'position',
        value: [124, -17]
      }, {
        tag: 'angle',
        value: -1185
      }, {
        tag: 'position',
        value: [117, -43]
      }, {
        tag: 'angle',
        value: -1200
      }, {
        tag: 'position',
        value: [103, -67]
      }, {
        tag: 'angle',
        value: -1215
      }, {
        tag: 'position',
        value: [83, -87]
      }, {
        tag: 'angle',
        value: -1230
      }, {
        tag: 'position',
        value: [58, -101]
      }, {
        tag: 'angle',
        value: -1245
      }, {
        tag: 'position',
        value: [30, -109]
      }, {
        tag: 'angle',
        value: -1260
      }, {
        tag: 'position',
        value: [0, -109]
      }, {
        tag: 'angle',
        value: -1275
      }]
    },
    'define square(x) {repeat(4) {forward(x);right(90);    }}square(100);square(20);': {
      inp: ['define square(x) {repeat(4) {forward(x);right(90);    }}square(100);square(20);'],
      out: [{
        tag: 'position',
        value: [0, 0]
      }, {
        tag: 'angle',
        value: 90
      }, {
        tag: 'position',
        value: [0, 100]
      }, {
        tag: 'angle',
        value: 0
      }, {
        tag: 'position',
        value: [100, 100]
      }, {
        tag: 'angle',
        value: -90
      }, {
        tag: 'position',
        value: [100, 0]
      }, {
        tag: 'angle',
        value: -180
      }, {
        tag: 'position',
        value: [0, 0]
      }, {
        tag: 'angle',
        value: -270
      }, {
        tag: 'position',
        value: [0, 20]
      }, {
        tag: 'angle',
        value: -360
      }, {
        tag: 'position',
        value: [20, 20]
      }, {
        tag: 'angle',
        value: -450
      }, {
        tag: 'position',
        value: [20, 0]
      }, {
        tag: 'angle',
        value: -540
      }, {
        tag: 'position',
        value: [0, 0]
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
        value: [0, 0]
      }, {
        tag: 'angle',
        value: 90
      }, {
        tag: 'position',
        value: [0, 3]
      }]
    },
    'forward(3); left(45); back(7); right(45);': {
      inp: ['forward(3); left(45); back(7); right(45);'],
      out: [{
        tag: 'position',
        value: [0, 0]
      }, {
        tag: 'angle',
        value: 90
      }, {
        tag: 'position',
        value: [0, 3]
      }, {
        tag: 'angle',
        value: 135
      }, {
        tag: 'position',
        value: [5, -2]
      }, {
        tag: 'angle',
        value: 90
      }]
    },
    'penup(); right(30); forward(5); pendown(); speed(2); left(60); forward(1); eraser(); back(2); home(); back(5); clear();': {
      inp: ['penup(); right(30); forward(5); pendown(); speed(2); left(60); forward(1); eraser(); back(2); home(); back(5); clear();'],
      out: [{
        tag: 'position',
        value: [0, 0]
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
        value: [3, 4]
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
        value: [3, 5]
      }, {
        tag: 'color',
        value: 'white'
      }, {
        tag: 'position',
        value: [4, 3]
      }, {
        tag: 'position',
        value: [0, 0]
      }, {
        tag: 'angle',
        value: 90
      }, {
        tag: 'position',
        value: [0, -5]
      }, {
        tag: 'clear'
      }, {
        tag: 'position',
        value: [0, 0]
      }, {
        tag: 'angle',
        value: 90
      }]
    },
    'penup(); forward(5); pendown(); speed(2);  forward(1); eraser(); back(2); home(); back(5); clear();': {
      inp: ['penup(); forward(5); pendown(); speed(2);  forward(1); eraser(); back(2); home(); back(5); clear();'],
      out: [{
        tag: 'position',
        value: [0, 0]
      }, {
        tag: 'angle',
        value: 90
      }, {
        tag: 'penup'
      }, {
        tag: 'position',
        value: [0, 5]
      }, {
        tag: 'pendown'
      }, {
        tag: 'speed',
        value: 2
      }, {
        tag: 'position',
        value: [0, 6]
      }, {
        tag: 'color',
        value: 'white'
      }, {
        tag: 'position',
        value: [0, 4]
      }, {
        tag: 'position',
        value: [0, 0]
      }, {
        tag: 'angle',
        value: 90
      }, {
        tag: 'position',
        value: [0, -5]
      }, {
        tag: 'clear'
      }, {
        tag: 'position',
        value: [0, 0]
      }, {
        tag: 'angle',
        value: 90
      }]
    },
    'penup(); pendown(); speed(2); eraser(); home(); clear();': {
      inp: ['penup(); pendown(); speed(2); eraser(); home(); clear();'],
      out: [{
        tag: 'position',
        value: [0, 0]
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
        tag: 'color',
        value: 'white'
      }, {
        tag: 'position',
        value: [0, 0]
      }, {
        tag: 'angle',
        value: 90
      }, {
        tag: 'clear'
      }, {
        tag: 'position',
        value: [0, 0]
      }, {
        tag: 'angle',
        value: 90
      }]
    },
    'forward(5);speed(2);  forward(1);  back(2);  back(5);': {
      inp: ['forward(5);speed(2);  forward(1);  back(2);  back(5);'],
      out: [{
        tag: 'position',
        value: [0, 0]
      }, {
        tag: 'angle',
        value: 90
      }, {
        tag: 'position',
        value: [0, 5]
      }, {
        tag: 'speed',
        value: 2
      }, {
        tag: 'position',
        value: [0, 6]
      }, {
        tag: 'position',
        value: [0, 4]
      }, {
        tag: 'position',
        value: [0, -1]
      }]
    },
    ' forward(1);  back(2);': {
      inp: [' forward(1);  back(2);'],
      out: [{
        tag: 'position',
        value: [0, 0]
      }, {
        tag: 'angle',
        value: 90
      }, {
        tag: 'position',
        value: [0, 1]
      }, {
        tag: 'position',
        value: [0, -1]
      }]
    },
    ' back(2);': {
      inp: [' back(2);'],
      out: [{
        tag: 'position',
        value: [0, 0]
      }, {
        tag: 'angle',
        value: 90
      }, {
        tag: 'position',
        value: [0, -2]
      }]
    }
  }
};


module.exports.data = data;