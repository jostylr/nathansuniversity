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
    return parser.apply(null, arguments);
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
      out: {
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
      }
    },
    'f(5);': {
      inp: ['f(5);'],
      out: {
        tag: 'statements',
        body: [{
          tag: 'call',
          name: 'f',
          args: [5]
        }]
      }
    },
    'var size;': {
      inp: ['var size;'],
      out: {
        tag: 'statements',
        body: [{
          tag: 'var',
          name: 'size'
        }]
      }
    },
    'size := 5;': {
      inp: ['size := 5;'],
      out: {
        tag: 'statements',
        body: [{
          tag: 'assignment',
          name: 'size',
          value: 5
        }]
      }
    },
    'repeat(18) {right(20);repeat(36) {forward(20);right(10);}}': {
      inp: ['repeat(18) {right(20);repeat(36) {forward(20);right(10);}}'],
      out: {
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
      }
    },
    'f();': {
      inp: ['f();'],
      out: {
        tag: 'statements',
        body: [{
          tag: 'call',
          name: 'f',
          args: []
        }]
      }
    },
    'define spiral(size) {    if (size < 30) {        forward(size);        right(15);        var newsize;        newsize := size * 1.02;        spiral(newsize);    }}spiral(5);': {
      inp: ['define spiral(size) {    if (size < 30) {        forward(size);        right(15);        var newsize;        newsize := size * 1.02;        spiral(newsize);    }}spiral(5);'],
      out: {
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
      }
    },
    'define square(x) {repeat(4) {forward(x);right(90);    }}square(100);square(20);': {
      inp: ['define square(x) {repeat(4) {forward(x);right(90);    }}square(100);square(20);'],
      out: {
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
      }
    },
    'f()': {
      inp: ['f()'],
      out: ['error', 'SyntaxError: "!=","*","+","-","/",";","<","<=","==",">",">=",[ \\n\\r\\t]']
    },
    'f(3, g(1));': {
      inp: ['f(3, g(1));'],
      out: [{
        tag: 'call',
        name: 'f',
        args: [3,
        {
          tag: 'call',
          name: 'g',
          args: [1]
        }]
      }]
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
      }, [0, 0, 90],
      {
        tag: 'position',
        value: [0, -5]
      }, {
        tag: 'clear'
      }]
    }
  }
};


module.exports.data = data;