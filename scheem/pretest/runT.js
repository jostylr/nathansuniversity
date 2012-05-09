/*globals module, require, console, exports*/

var _ = require('underscore');

var run = require('../run');

module.exports.run = function () {
  return run.apply(null, arguments);
};

//----
module.exports.suites = {
  trial: function () {
    return run.apply(null, arguments);
  }
};


var data = {
  trial: {
    add: {
      inp: ['(+ 3 4)'],
      out: 7
    }
  }
};


module.exports.data = data;