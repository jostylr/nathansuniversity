/*globals module, require, console, exports*/

var fs = require('fs');

var pegjs = require('pegjs');

var tort = pegjs.buildParser(fs.readFileSync("tort.peg", "utf8"));

var parser = tort.parse;

//----
module.exports.suites = {
  'add': function () {
    return parser.apply(null, arguments);
  },
  'arith': function () {
    return parser.apply(null, arguments);
  },
  'stat': function () {
    return parser.apply(null, arguments);
  },
  'str': function () {
    return parser.apply(null, arguments);
  }
};


var data = {
  add: {
    '3 +2;': {
      inp: ['3 +2;'],
      out: [{
        tag: 'op',
        op: '+',
        left: 3,
        right: 2
      }]
    },
    '3 +2 - 5;': {
      inp: ['3 +2 - 5;'],
      out: [{
        tag: 'op',
        op: '+',
        left: 3,
        right: {
          tag: 'op',
          op: '-',
          left: 2,
          right: 5
        }
      }]
    }
  },
  arith: {
    '3*4 +2;': {
      inp: ['3*4 +2;'],
      out: [{
        tag: 'op',
        op: '+',
        left: {
          tag: 'op',
          op: '*',
          left: 3,
          right: 4
        },
        right: 2
      }]
    },
    '3 < 2;': {
      inp: ['3 < 2;'],
      out: [{
        tag: 'op',
        op: '<',
        left: 3,
        right: 2
      }]
    },
    '3 < 2 + 5;': {
      inp: ['3 < 2 + 5;'],
      out: [{
        tag: 'op',
        op: '<',
        left: 3,
        right: {
          tag: 'op',
          op: '+',
          left: 2,
          right: 5
        }
      }]
    },
    '3 * 2 < 2 + 5;': {
      inp: ['3 * 2 < 2 + 5;'],
      out: [{
        tag: 'op',
        op: '<',
        left: {
          tag: 'op',
          op: '*',
          left: 3,
          right: 2
        },
        right: {
          tag: 'op',
          op: '+',
          left: 2,
          right: 5
        }
      }]
    },
    '-3 * 2 < 2 - 5;': {
      inp: ['-3 * 2 < 2 - 5;'],
      out: [{
        tag: 'op',
        op: '<',
        left: {
          tag: 'op',
          op: '*',
          left: -3,
          right: 2
        },
        right: {
          tag: 'op',
          op: '-',
          left: 2,
          right: 5
        }
      }]
    },
    '-3 * 2 < 2 - -5;': {
      inp: ['-3 * 2 < 2 - -5;'],
      out: [{
        tag: 'op',
        op: '<',
        left: {
          tag: 'op',
          op: '*',
          left: -3,
          right: 2
        },
        right: {
          tag: 'op',
          op: '-',
          left: 2,
          right: -5
        }
      }]
    },
    '-3 * 2 < 2 - - -5;': {
      inp: ['-3 * 2 < 2 - - -5;'],
      out: ['error', 'SyntaxError: [0-9]']
    }
  },
  stat: {
    'repeat (30) { 2 + 2; }': {
      inp: ['repeat (30) { 2 + 2; }'],
      out: [{
        tag: 'repeat',
        n: 30,
        body: [{
          tag: 'op',
          op: '+',
          left: 2,
          right: 2
        }]
      }]
    },
    'f(5);': {
      inp: ['f(5);'],
      out: [{
        tag: 'call',
        name: 'f',
        args: [5]
      }]
    },
    'var size;': {
      inp: ['var size;'],
      out: [{
        tag: 'var',
        name: 'size'
      }]
    },
    'size := 5;': {
      inp: ['size := 5;'],
      out: [{
        tag: 'assignment',
        name: 'size',
        value: 5
      }]
    },
    'repeat(18) {right(20);repeat(36) {forward(20);right(10);}}': {
      inp: ['repeat(18) {right(20);repeat(36) {forward(20);right(10);}}'],
      out: [{
        tag: 'repeat',
        n: 18,
        body: [{
          tag: 'repeat',
          n: 36,
          body: [{
            tag: 'call',
            name: 'right',
            args: [10]
          }, {
            tag: 'call',
            name: 'forward',
            args: [20]
          }]
        }, {
          tag: 'call',
          name: 'right',
          args: [20]
        }]
      }]
    },
    'f();': {
      inp: ['f();'],
      out: [{
        tag: 'call',
        name: 'f',
        args: []
      }]
    },
    'define spiral(size) {    if (size < 30) {        forward(size);        right(15);        var newsize;        newsize := size * 1.02;        spiral(newsize);    }}spiral(5);': {
      inp: ['define spiral(size) {    if (size < 30) {        forward(size);        right(15);        var newsize;        newsize := size * 1.02;        spiral(newsize);    }}spiral(5);'],
      out: [{
        tag: 'call',
        name: 'spiral',
        args: [5]
      }, {
        tag: 'define',
        name: 'spiral',
        args: ['size'],
        body: [{
          tag: 'if',
          cond: {
            tag: 'op',
            op: '<',
            left: {
              tag: 'identifier',
              name: 'size'
            },
            right: 30
          },
          body: [{
            tag: 'call',
            name: 'spiral',
            args: [{
              tag: 'identifier',
              name: 'newsize'
            }]
          }, {
            tag: 'assignment',
            name: 'newsize',
            value: {
              tag: 'op',
              op: '*',
              left: {
                tag: 'identifier',
                name: 'size'
              },
              right: 1.02
            }
          }, {
            tag: 'var',
            name: 'newsize'
          }, {
            tag: 'call',
            name: 'right',
            args: [15]
          }, {
            tag: 'call',
            name: 'forward',
            args: [{
              tag: 'identifier',
              name: 'size'
            }]
          }]
        }]
      }]
    },
    'define square(x) {repeat(4) {forward(x);right(90);    }}square(100);square(20);': {
      inp: ['define square(x) {repeat(4) {forward(x);right(90);    }}square(100);square(20);'],
      out: [{
        tag: 'call',
        name: 'square',
        args: [20]
      }, {
        tag: 'call',
        name: 'square',
        args: [100]
      }, {
        tag: 'define',
        name: 'square',
        args: ['x'],
        body: [{
          tag: 'repeat',
          n: 4,
          body: [{
            tag: 'call',
            name: 'right',
            args: [90]
          }, {
            tag: 'call',
            name: 'forward',
            args: [{
              tag: 'identifier',
              name: 'x'
            }]
          }]
        }]
      }]
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
        args: [{
          tag: 'call',
          name: 'g',
          args: [1]
        },
        3]
      }]
    }
  },
  str: {
    'color(\'red\');': {
      inp: ['color(\'red\');'],
      out: [{
        tag: 'call',
        name: 'color',
        args: [{
          tag: 'string',
          value: 'red'
        }]
      }]
    }
  }
};


module.exports.data = data;