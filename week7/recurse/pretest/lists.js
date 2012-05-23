/*globals require, module*/
/*jshint asi:true */

var List = require('../list.js');

//need a little something to pass in arguments to constructor
//http://stackoverflow.com/questions/1959247/javascript-apply-on-constructor-throwing-malformed-formal-parameter
var applySecond = function () {
    function tempCtor() {}
    return function (ctor, args) {
      tempCtor.prototype = ctor.prototype;
      var instance = new tempCtor();
      ctor.apply(instance, args);
      return instance;
    }
  }();

//----
module.exports.suites = {
  'List': function () {
    var list = applySecond(List, arguments)
    
    return list.itemsToArray([]);
  },
  'get' : function (arr, n, tag) {
    var list = new List(arr, tag);

    return list.get(n, tag);
  }
};


var data = {
  List: {
    '1': {
      inp: [
        [1]
      ],
      out: [1]
    },
    '5,6': {
      inp: [
        [5, 6]
      ],
      out: [5, 6]
    },
    '[]': {
      inp: [],
      out: ['error', 'TypeError: Cannot read property \'0\' of undefined']
    },
    'art,3,4,[object Object]': {
      inp: [
        ['art', [3, 4],
        {
          a: 4
        }]
      ],
      out: ['art', [3, 4],
      {
        a: 4
      }]
    }
  }
};


module.exports.data = data;