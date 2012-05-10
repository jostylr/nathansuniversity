/*globals module, require, console, exports*/

var _ = require('underscore');

var evalScheem = require('../evalScheem').evalScheem;

//set this to {debugS:#} for debugging, use {env: 'x'} for getting a return value of the env.
//----
module.exports.suites = {
  add: function () {
    return evalScheem.apply(null, arguments);
  },
  sub: function () {
    return evalScheem.apply(null, arguments);
  },
  mult: function () {
    return evalScheem.apply(null, arguments);
  },
  div: function () {
    return evalScheem.apply(null, arguments);
  },
  pow: function () {
    return evalScheem.apply(null, arguments);
  },
  mod: function () {
    return evalScheem.apply(null, arguments);
  },
  quote: function () {
    return evalScheem.apply(null, arguments);
  },
  lambda: function () {
    return evalScheem.apply(null, arguments);
  },
  hash: function () {
    return evalScheem.apply(null, arguments);
  },
  ifel: function () {
    return evalScheem.apply(null, arguments);
  },
  def: function () {
    var t = {
      env: 'x'
    };
    return evalScheem.apply(t, arguments);
  },
  set: function () {
    return evalScheem.apply(null, arguments);
  },
  begin: function () {
    return evalScheem.apply(null, arguments);
  },
  let: function () {
    return evalScheem.apply(null, arguments);
  }
};


var data = {
  add: {
    zero: {
      inp: [
        ['+']
      ],
      out: ['error', 'insufficient arguments +']
    },
    one: {
      inp: [
        ['+', 2]
      ],
      out: 2
    },
    two: {
      inp: [
        ['+', 3, 4]
      ],
      out: 7
    },
    three: {
      inp: [
        ['+', 3, 4, 5]
      ],
      out: 12
    },
    four: {
      inp: [
        ['+', 3, 4, 5, 6]
      ],
      out: 18
    }
  },
  sub: {
    zero: {
      inp: [
        ['-']
      ],
      out: ['error', 'insufficient arguments -']
    },
    one: {
      inp: [
        ['-', 2]
      ],
      out: -2
    },
    two: {
      inp: [
        ['-', 3, 4]
      ],
      out: -1
    },
    three: {
      inp: [
        ['-', 3, 4, 5]
      ],
      out: -6
    },
    four: {
      inp: [
        ['-', 3, 4, 5, 6]
      ],
      out: -12
    }
  },
  mult: {
    zero: {
      inp: [
        ['*']
      ],
      out: ['error', 'insufficient arguments *']
    },
    one: {
      inp: [
        ['*', 2]
      ],
      out: 2
    },
    two: {
      inp: [
        ['*', 3, 4]
      ],
      out: 12
    },
    three: {
      inp: [
        ['*', 3, 4, 5]
      ],
      out: 60
    },
    four: {
      inp: [
        ['*', 3, 4, 5, 6]
      ],
      out: 360
    }
  },
  div: {
    zero: {
      inp: [
        ['/']
      ],
      out: ['error', 'insufficient arguments /']
    },
    one: {
      inp: [
        ['/', 2]
      ],
      out: 0.5
    },
    two: {
      inp: [
        ['/', 3, 4]
      ],
      out: 0.75
    },
    three: {
      inp: [
        ['/', 3, 4, 5]
      ],
      out: 0.15
    },
    four: {
      inp: [
        ['/', 3, 4, 5, 6]
      ],
      out: 0.024999999999999998
    }
  },
  mod: {
    zero: {
      inp: [
        ['%']
      ],
      out: ['error', 'insufficient arguments %']
    },
    one: {
      inp: [
        ['%', 2]
      ],
      out: ['error', 'insufficient arguments %']
    },
    two: {
      inp: [
        ['%', 3, 4]
      ],
      out: 3
    },
    three: {
      inp: [
        ['%', 3, 4, 5]
      ],
      out: ['error', 'too many arguments %']
    },
    four: {
      inp: [
        ['%', 3, 4, 5, 6]
      ],
      out: ['error', 'too many arguments %']
    }
  },
  pow: {
    zero: {
      inp: [
        ['^']
      ],
      out: ['error', 'insufficient arguments ^']
    },
    one: {
      inp: [
        ['^', 2]
      ],
      out: ['error', 'insufficient arguments ^']
    },
    two: {
      inp: [
        ['^', 3, 4]
      ],
      out: 81
    },
    three: {
      inp: [
        ['^', 3, 4, 5]
      ],
      out: ['error', 'too many arguments ^']
    },
    four: {
      inp: [
        ['^', 3, 4, 5, 6]
      ],
      out: ['error', 'too many arguments ^']
    }
  },
  quote: {
    'an atom': {
      inp: [
        ['quote', 'dog']
      ],
      out: 'dog'
    },
    'a number': {
      inp: [
        ['quote', 3]
      ],
      out: 3
    },
    'a list': {
      inp: [
        ['quote', [1, 2, 3]]
      ],
      out: [1, 2, 3]
    },
    eval: {
      inp: [
        ['quote', [1, 3, 'x', 4]]
      ],
      out: [1, 3, 'x', 4]
    }
  },
  lambda: {
    id: {
      inp: [
        [
          ['lambda', 'x', 'x'], 2]
      ],
      out: [2]
    },
    args: {
      inp: [
        [
          ['lambda', ['x', 'y'],
            ['+', 'x', 'y']
          ], 2, 3]
      ],
      out: [5]
    }
  },
  ifel: {
    basic: {
      inp: [
        ['if', ['quote', '#t'], 3, 4]
      ],
      out: 3
    },
    'basic f': {
      inp: [
        ['if', ['quote', '#f'], 3, 4]
      ],
      out: 4
    }
  },
  def: {
    simple: {
      inp: [
        ['define', 'x', 3]
      ],
      out: 3
    }
  },
  begin: {
    simple: {
      inp: [
        ['begin', ['define', 'x', 3], 'x']
      ],
      out: 3
    },
    multi: {
      inp: [
        ['begin', ['define', 'x', 3, 'y', 4],
          ['+', 'x', 'y']
        ]
      ],
      out: 7
    },
    set: {
      inp: [
        ['begin', ['define', 'x', 3, 'y', 4],
          ['set!', 'y', 3],
          ['+', 'x', 'y']
        ]
      ],
      out: 6
    },
    hash: {
      inp: [
        ['begin', ['define', 'x', ['#', 'y', 5, 'z', 8]],
          ['+', ['.', 'x', ['quote', 'y']],
            ['.', 'x', ['quote', 'z']]
          ]
        ]
      ],
      out: 13
    }
  },
  let: {
    sum: {
      inp: [
        ['let', 'x', 3, 'y', 5, ['+', 'x', 'y']]
      ],
      out: 8
    }
  }
};


module.exports.data = data;