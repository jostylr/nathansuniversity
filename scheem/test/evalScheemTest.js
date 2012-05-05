/*jslint evil: true*/
/*globals module, require, console, exports, process*/

var flint; 

var _ = require('underscore');
var assert = require('assert');
var evalScheem = require('../evalScheem').evalScheem;

var fs = require('fs');
var repl = require('repl');
var util = require('util');

var data, names = [], out = {}, inp = {}, file, errors = []; 


var global = {depth : null};

//overwrite default level of 2 with unlimited depth!

var c = {};

c.global = global;
c.out = out;
c.inp = inp;
c.names = names;
c.errors = errors;
c.count = 0;


c.util = util;
c.repl = repl;

//lists all outputs name and status or the output of the numbered one.
c.all = function (pos) {
  var s, t, ret, i, n;
  if (typeof pos !== "undefined") {
    s = names[pos][0];
    t = names[pos][1];
    return [s + "/" + t, inp[s][t], out[s][t]];
  } else {
    n = names.length;
    ret = [];
    for (i = 0; i < n; i += 1) {
      ret.push([i , names[i]]);
    }
    return ret;
  }
  
};

//lists those that differ from data
c.differs =  function (pos) {
  var s, t, ret, i, n;
  if (pos) {
    s = names[pos][0];
    t = names[pos][1];
    return [s + "/" + t,  inp[s][t], out[s][t], data[s][t]];
  } else {
    n = names.length;
    ret = [];
    for (i = 0; i < n; i += 1) {
      if (names[i][2] !== true) {
        ret.push([i, names[i]]);
      }
    }
    return ret;
  }  
};

//lists those that differ from data
c.fullDiffers =  function () {
  var s, t, ret, i, n;
  n = names.length;
  ret = [];
  for (i = 0; i < n; i += 1) {
    s = names[i][0];
    t = names[i][1];  
    if (names[i][2] !== true) {
      ret.push([i, names[i], {inp: inp[t][s], out: out[t][s], old: data[t][s]} ]);
    }
  }
  return ret;  
};


//store an output into data
c.store = function (pos) {
  var s = names[pos][0];
  var t = names[pos][1];
  data[s][t] = [inp[s][t], out[s][t]];  
};

//store all--unwise to use
c.stall = function () {
  var s, t, i, n;
  n = names.length;
  for (i = 0; i < n; i += 1){
    s = names[i][0];
    t = names[i][1];
    data[s][t] = {inp: inp[s][t], out: out[s][t]};  
  }
  return "data stored";
}

//save current data state to file
c.save = function (fname) {
  fname = fname || file;
  try {
    if (fname.indexOf('.json') !== -1 ) {
       fs.writeFileSync(fname, JSON.stringify(data), 'utf8');
     } else {
       fs.writeFileSync(fname, "data = " + util.inspect(data, false, null), 'utf8');
     }  
     return "successfully saved";
   } catch (e) {
     return ["failed to save", e];
   }
   
};


var makeTests = function (suites) {
  var suite, fun, test, tests, input, result;
  try {
    if (file.indexOf('.json') !== -1 ) {
      c.data = data = JSON.parse(fs.readFileSync(file, 'utf8'));
    } else {
      c.data = data = eval(fs.readFileSync(file, 'utf8'));
    }
  } catch (e) {
    errors.push(e);
    c.data = data = {};
  }
  for (suite in suites) {
    if (!data.hasOwnProperty(suite)) {
      data[suite] = {};
    }
    out[suite] = {};
    inp[suite] = {};
    fun = suites[suite][0];
    tests = suites[suite][1];
    for (test in tests) {
      try {
        input = tests[test];
        if (_.isArray(input)) { 
          //assume deepEqual desired
          inp[suite][test] = input;
          out[suite][test] = result = fun.apply(null, input);
          if (data[suite][test]) {
            result = _.isEqual(result, data[suite][test].out);
            names.push([suite, test, result]);
          } else {
            names.push([suite, test, "new"]);            
            c.count += 1;
          }
        }  else {
          //full test object
          inp[suite][test] = input.inp;
          out[suite][test] = result = fun.apply(null, input.inp);
          switch (input.t) {
            case "throw" : 
              try {
                
              }
          }
          if (data[suite][test]) {
            result = _.isEqual(result, data[suite][test].out);
            names.push([suite, test, result]);
          } else {
            names.push([suite, test, "new"]);            
            c.count += 1;
          }
          
        }
      } catch (f) {
        out[suite][test] = f;
        names.push([suite, test, "error"]);
        c.count += 1;
      }
    }
  }

  //, ev);
  
};


c.file = file = 'testdata.js';

makeTests( {evalScheem :   [evalScheem, { 
     'a number' : [['quote', 3], {}]
    , 'an atom' : [['quote', 'dog'], {}]
    , 'a list' : [['quote', [1, 2, 3]], {}]
    , 'throw' : {t: 'throws',  inp: [['fail']], error: 42}
    }]
  }
);

console.log(util.inspect(c.fullDiffers(), false, null, true));

console.log(c.count, "failues out of", names.length, "tests");


repl.writer = function (obj) {return util.inspect(obj, false, global.depth, true);};

var rs = repl.start('>');  //{prompt:'>', writer : function (obj) {return util.inspect(obj, false, null, true);}});
var cs  = rs.context;

_.defaults(cs, c);

/*

suite('quote', function() {
    test('a number', function() {
        assert.deepEqual(
            evalScheem(),
            3
        );
    });
    test('an atom', function() {
        assert.deepEqual(
            evalScheem(['quote', 'dog'], {}),
            'dog'
        );
    });
    test('a list', function() {
        assert.deepEqual(
            evalScheem(['quote', [1, 2, 3]], {}),
            [1, 2, 3, 4]
        );
    });
    test('throws', function () {
      assert.throws(
        function() {
          throw new Error("Wrong value");
        },
        Error
      );    });
    test('throws', function () {
      assert.throws(
        function() {
          throw new Error("Wrong value");
        },
        /value/
      );    });
      test('throws', function () {
        assert.throws(
          function() {
            throw new Error("Wrong value");
          },
          function(err) {
            if ( (err instanceof Error) && /value/.test(err) ) {
              return true;
            }
          },
          "unexpected error"
        );    })
    

      
});


*/