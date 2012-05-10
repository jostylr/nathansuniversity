/*globals module, require, console, exports*/

var _ = require('underscore');
var util = require('util');

var debugF;

var initenv = function () {
  return {
    vars : {
      '+' :  function (arr) {
        
        if (!arr || arr.length === 0) {
          throw "insufficient arguments +";
        }
        var i, sum = 0, n = arr.length;
        for (i = 0; i < n; i += 1) {
          sum += arr[i];
        }
        return sum;
      },
      '-' : function (arr) {
        if (!arr || arr.length === 0) {
          throw "insufficient arguments -";
        }
        if (arr.length === 1) {
          return -1*arr[0]; // inconsistent behavior.
        }
        var i, sum = arr[0], n = arr.length;
        for (i = 1; i < n; i += 1) {
          sum -= arr[i];
        }
        return sum;        
      },
      '*': function (arr) {
        if (!arr || arr.length === 0) {
          throw "insufficient arguments *";
        }
        var i, n = arr.length, prod = 1;
        for (i = 0; i < n; i += 1) {
          prod *= arr[i];
        }
        return prod;
      },
      '/' : function (arr) {
        if (!arr || arr.length === 0) {
          throw "insufficient arguments /";
        }
        if (arr.length === 1) {
          return 1/arr[0]; // inconsistent behavior.
        }
        
        var i, n = arr.length, prod = arr[0];
        for (i = 1; i < n; i += 1) {
          prod /= arr[i];
        }
        return prod;
      },
      '%' : function (arr) {
        if (!arr || arr.length < 2) {
          throw "insufficient arguments %";
        } else if (arr.length > 2) {
          throw "too many arguments %";
        }
        return arr[0] % arr[1];
      },
      '^' : function (arr) {
        if (!arr || arr.length < 2) {
          throw "insufficient arguments ^";
        } else if (arr.length > 2) {
          throw "too many arguments ^";
        }
        return Math.pow(arr[0], arr[1]);
      }, 
      '.' :  function (arr, s, v, env) { // (. name prop1 'prop2  ) = name[prop1].prop2
        // arr = [hash, dude, prop2] where prop1 evaluates to dude
        var cur, i, n = arr.length, old;
        cur = arr[0];
        for (i = 1; i < n; i += 1) {
          old = cur;
          cur = cur[arr[i]];
        }
        if (_.isFunction(cur)) {
          return function (a, s, v, e) {  //adding this
            return cur(a, s, v, e, old);
          };
        }
        return cur; 
      }
      
          
    },
    parent : null
  };
};

var lookup = function (env, v) {
  while (env) {
    debugF(env.vars)
    if (env.vars.hasOwnProperty(v) ) {
      return env.vars[v];
    } else {
      env = env.parent;
    }
  }
  throw "no such var " + v;
};

// pair up elements name : value
// {type: pair, name: name}, value
// reverse going down
var pair = function (elms, stack) {
  var i
    , n = elms.length
  ;
  
  if (n % 2 !== 0) {
    throw "pairing impossible with odd length " + n;
  }
  
  for (i = n-2; i >= 0 ; i -= 2) {
    stack.push({type : "pair", name : elms[i] }, elms[i+1]);
  }
};

var lambda = function (cur, lex) {
  return function (args, stack, values, env, self) {
    var newenv, v, a, i, n;
    stack.push({type: 'envChange', env : env});
    stack.push({type: 'fret'});
    values.unshift([]);
    stack.push(cur[2]);
    newenv = {vars : {}, parent : lex};
    v = newenv.vars;
    //add in args
    if (self) {
      v["this"] = self;
    }
    v["arguments"] = args; 
    a = cur[1];
    n = a.length;
    for (i = 0; i < n; i += 1) {
      v[a[i]] = args[i];
    }
    stack.push({type : 'envChange', env : newenv });
  };
};
 
var evalScheem = function (expr) {
  var cur, env, temp, hash
    , stack = [expr]
    , values = [[]]
  ;

  if (this && this.hasOwnProperty('debugS')) {
    debugF = console.log;
  } else {
    debugF = function () {};
  }

  //flag objects
  //var 
  
  //initial environment
  env = initenv();
    
  while (stack.length !== 0) {
    
    cur = stack.pop();
    
    //debugF(stack)
        
    if (typeof cur === 'number') {
      values[0].push( cur );
    } else if (typeof cur === 'string') {
      values[0].push(lookup(env, cur) );
    } else if (_.isArray(cur) ) {
      //every list should finish with unshifting the array back and pushing on the value
      values.unshift([]);
      switch (cur[0]) {
        case 'quote' :
          values.shift(); // not useful
          values[0].push(cur[1]);
        break;
        case 'if' : 
          stack.push({type:'if', then : cur[2], 'el' : cur[3] });
          stack.push(cur[1]);
        break;
        case 'define' : 
          stack.push({type : 'define'});
          pair(cur.slice(1), stack);
        break;
        case 'set!' : 
          stack.push({type: 'set!'});
          pair(cur.slice(1), stack);
        break;
        case '#' : 
          stack.push({type : 'hash'});
          pair(cur.slice(1), stack);
        break;
        case 'lambda' : 
          values.shift();
          values[0].push(lambda(cur, env));
        break;
        case 'begin' :
          stack.push({type: 'begin', last : cur[cur.length-1]});
          stack.push.apply(stack, cur.slice(1, -1).reverse() );
        break;
        case 'let' :
          stack.push({type: 'let', body : cur[cur.length-1]});
          pair(cur.slice(1, -1), stack );
        break;
        default : //functions
          stack.push({type: 'f'});
          stack.push.apply(stack, cur.slice().reverse() ); //why does concat not work here? 
      }
    } else { // flag object
      debugF(cur)
      if (! cur.hasOwnProperty('type') ) {
        throw "bad object" + util.inspect(cur);
      }
      switch (cur.type) {
        case 'f' : 
          //values[0] should have f as the first and the arguments as the rest
          temp = values.shift();
          temp = temp[0]( temp.slice(1), stack, values, env );
          if (typeof temp !== "undefined") {
            //function returned, done
            values[0].push( temp ); //why is temp needed?
          } 
        break;
        case 'fret' :
          // function return values
          temp = values.shift();
          values[0].push( temp );
        break;
        case 'envChange' :  
          env = cur.env;
        break;
        case 'if' : 
          if (values[0][0] === '#t') {
            stack.push(cur.then);
          } else {
            stack.push(cur.el);
          }
          debugF('if', cur, stack)
          values.shift();
        break;
        case 'pair' :
          temp = values[0].pop();
          values[0].push( [cur.name, temp]);
        break;
        case 'define' : 
          temp = values.shift(); //pop off the paired values
          while (temp.length) {
            cur = temp.pop();
            if (env.vars.hasOwnProperty(cur[0])) {
              throw "variable already defined: " + cur[0];
            } else {
              env.vars[cur[0]] = cur[1];
            }
          }
        break;
        case 'set!' : 
        temp = values.shift(); //pop off the paired values
        while (temp.length) {
          cur = temp.pop();
          if (! env.vars.hasOwnProperty(cur[0])) {
            throw "variable not yet  defined: " + cur[0];
          } else {
            env.vars[cur[0]] = cur[1];
          }
        }
        break;
        case 'hash' : 
        temp = values.shift(); //pop off the paired values
        hash = {};
        while (temp.length) {
          cur = temp.pop();
          hash[cur[0]] = cur[1];
        }
        values[0].push(hash);
        break;
        case 'begin' :
          values.shift(); // no value for these lines
          stack.push(cur.last);
        break;
        case 'let' :
          temp = values.shift(); //pop off the paired values
          stack.push({type: 'envChange', env : env });
          stack.push(cur.body);
          // new environment;
          env = {
            vars : {},
            parent : env
          };
          while (temp.length) {
            cur = temp.pop();
            env.vars[cur[0]] = cur[1];
          }
        break;
     }
    }
  }
  
//  r.define('sum', ['begin', ['define', ]'let', 'x', 3, 'y', 5, ['+', 'x', 'y']])
  
  if (this.env) {
    return lookup(env, this.env);
  }
  return values[0][0];
  
};



module.exports.evalScheem = evalScheem;