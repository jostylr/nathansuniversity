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
    console.log(list);
    return list.itemsToArray([]);
  }
};


var data = {
  List: {
    '1': {
      inp: [[1]],
      out: [1]
    },
    '5,6': {
      inp: [[5, 6]],
      out: [5, 6]
    },
    '[]': {
      inp: [],
      out: [undefined]
    },
    'art,3,4,[object Object]': {
      inp: [['art', [3, 4],
            {
              a: 4
            }]],
      out: ['art', [3, 4],
      {
        a: 4
      }]
    }
  }
};


module.exports.data = data;