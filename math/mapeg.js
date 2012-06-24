/*globals module, console */
// this takes parsed output from peg and processes it
// most of the language is dynamically built, but we add in some hooks here

var JS;  //environment object
var run; // takes in statements, env; parses; calls linerun
var linerun; // actual evaluation

var log = (function () {
  var loga = [];
  var ret = function () {
    loga.push(arguments);
  };
  ret.inspect = function () {
    console.log(loga);
  };
  ret.loga = loga;
  return ret;
}());

var noop = function () {};

// Evstack is a list object
var LineNode = function (item, bp, type) {
  this.item = item;
  this.bp = bp;
  this.type = type || item.type || "TBD";
  this.sub = [];
  this.parent = null;
  return this;
};

var Lp = LineNode.prototype;

Lp.gobble = function (linenode) {
  var right = this;
  var old = this;
  while ( (right !== null) && (linenode.bp >= right.bp) ) {
    old = right;
    right = right.parent;
  }
  if (right === null) {
    linenode.sub.push(old);
    return linenode;
  } else {
    if (right.hasOwnProperty("custom") ){
      right.custom(linenode);
    } else {
      linenode.parent = right;
      right.sub.push(linenode);
    }
    return false;
  }
};

var uid = (function () {
  var count = 0;
  return function () {
    count += 1;
    return "N"+count;
  };
} () );


var Environment = function (options) {
  options = options || {};
  this.parent = options.parent || null;
  this.name = options.name || uid();
  this.vars = options.vars || {};
  this.sym = options.sym || {};
  return this;
};

// does the absolute value stuff
// make a hook to override
var absLookup = {
  "1,1" : function (expr, env) {
    return Math.abs(run(expr, env));
  }
};

var abs = function (expr, left, right, env) {
  try {
    return absLookup[left + "," + right](expr, env);
  } catch (e) {
    throw "unknown absolute value bars matching: " + left + right;
  }
};



// lookups current token and returns it; false otherwise
var lookup = function (name, env) {
  while (env) {
    if (env.vars.hasOwnProperty(name) ) {
      return env.vars[name];
    }
    env = env.parent;
  }
  return null;
};

var useType = function (type, nd) {
  var temp;
  if (nd.item.types.hasOwnPropety(type) ) {
    temp = nd.item.types[type];
    nd.type = type[0];
    nd.evaluate = type[1];
  } else {
    nd.type = "void";
    nd.evaluate = noop;
    log("default void type used, noop", type, nd);
  }
};

var typeThis = function (nd) {
  var i, n, types, sub;
  if (nd.type !== "TBD") {
    return nd.type;
  }
  types = [];
  sub = nd.sub;
  n = sub.length;
  if (n === 0 ) {
    return useType("void", nd);
  }
  for (i = 0; i < n; i += 1) {
    types.push(typeThis(sub[i]));  
  }
  var str = types.join(types, ",");
  if (nd.item.types.hasOwnProperty(str) ) {
    return useType(str, nd);
  }
  // try to get something like bool, num, num, num 
  // into  bool,num+
  var last = types[n-1];
  i = n-2;
  while (i >= 0) {
    if (last !== types[i]) {
      break;
    }
    i -= 1;
  }
  i += 1;
  if (i === 0) {
    return useType(last, nd);
  } else {
    return useType(types.slice(0, i).join(",") + "," + last + "+");
  }
};

// the precedence and associativity should all be done and arranged
// just run it
linerun = function (nd, env) {
  var item = nd.item;
  if (nd.type === "TBD") {
    typeThis(nd);
  }
  switch (item.tag) {
        case "tok" :
          // should only appear for unassigned variables
          return item;
        case "string" :
        case "terminal" :
          return item.value;
        case "sci" :
        case "dec" :
        case "int" : 
          return item;
        case "abs" :
          // item.expr is not processed yet
          return abs(item.expr, item.left, item.right, env);
        case "block" :
          // this is a block designed to be run through
          return run(item.value, env);
        default :
          // it should be already somewhat processed here
          if (item.hasOwnProperty("evaluate")) {
           return item.evaluate(item, env); 
         } else {
          throw "unknown type: " + item.tag;
        }
      }

};




//states is an array of statements (arrays of obj)
run = module.exports = function (states, environment) {
  environment = environment || new Environment({vars:JS});
  var doc = states.slice();
  var statem = doc[0];
  var i = 0;
  var ii, cur, extree, result, right, lines = [];
  while (i < doc.length) {
    cur = statem[0];
    ii = 0;
    right = extree = null;
    while (ii < statem.length) {
      if (cur.tag === "tok") {
        result = lookup(cur.value, environment);
        if (result === null) {
          result = new LineNode(cur, 0);
        } else {
          result = new LineNode(result, result.bp);
          result.tok = cur;
        }
      } else {
        result = new LineNode(cur, 0);
      }
      if (extree === null) {
        right = extree = result;
      } else {
        // the right most one tries to use it, moving up
        // if top is reached, then extree gets replaced
        extree = right.gobble(result) || extree;
      }
      right = result;
      ii += 1;
      cur = statem[ii];
    }
    //statement compiled, now run.
    lines.push(linerun(extree, environment));
    i += 1;
    statem = doc[i];
  }
  return lines;
};

// takes in an array of nodes, env, and operator function
// loops over array feeding op the eval'd node and the local
// op() should return a local var to feedback, it will be given back
var arrlinerun = function (arr, env, op)  {
  var res;
  var local = op();
  var flag = {brk : false}; // allows short circuiting
  var i, n = arr.length;
  for (i = 0; i < n; i += 1) {
    res = linerun(arr[i], env);
    local = op(local, res, flag);
    if (flag.brk) {
      return local;
    }
  }
  // just one gives opportunity to 
  return op(local);
};


// base library


var h = {
  numparse : function (left) {
    var numstr = left.join(''); 
    var num = [];
    while (numstr.length > 6 ) {
      num.unshift(parseInt(numstr.slice(-6), 10));
      numstr = numstr.slice(0, -6);
    } 
    num.unshift(parseInt(numstr, 10));
    num.reverse();
    return num;
  },
  numtostr : function (num) {
    var ret = [], str;
    var i, n = num.length;
    for (i = 0; i < n-1; i += 1) {
      str = num[i].toString(10);
      str += h.zeros(6 - str.length);
      ret.unshift(str);

    }
    ret.unshift(num[0].toString(10));
    return ret.join("");
  },
  level : function (a, b) {
    if (a.E === b.E) {
      return ;
    }
    if (a.E > b.E) {
      h.save(a);
      a.value = h.numparse(h.numtostr(a.value) + h.zeros(a.E-b.E) );
      a.E = b.E;
    } else {
      h.save(b);
      b.value = h.numparse(h.numtostr(b.value) + h.zeros(b.E-a.E) );
      b.E = a.E;
    }
  },
  save : function (a) {
    a.old = [a.value, a.E];
  },
  zeros : function (num) {
    var i, ret = [];
    for (i = 0; i < num; i += 1) {
      ret.push("0");
    }
    return ret.join("");
  },
  restore : function (a) {
    if (a.hasOwnProperty("old") ) {
      a.value = a.old[0];
      a.E = a.old[1];
      delete a.old;
    }
  },
  adjust : function (a) {
    var i,  cur, big, v = a.value, n = v.length;
    for (i = 0; i < n; i += 1) {
      cur = v[i];
      if (cur > 999999) { // too big
        big = Math.floor(cur/1e6)*1e6;
        v[i] = cur - big;
        v[i+1] = big + (v[i+1] || 0);
      } else if (cur < 0) { // too small
        v[i] = 1e6 + cur;
        v[i+1] = (v[i+1] || 0) - 1;
      }
    }
    // after adjusting, leading is negative so negate
    if (v[v.length-1] < 0) {
      v[v.length-1] *= -1;
      a.neg = !a.neg;
    }
    //minimizes up to 6 places
    while (v[0] === 0 ) {
      v.shift();
      a.E = a.E+6;
    }
    //minimizes the rest
    var temp = v[0].toString(10);
    while (temp[temp.length-1] === "0") {
      temp = temp.slice(0, -1);
      a.E = a.E+1; 
    }
    v[0] = parseInt(temp, 10);
  }, 
  newnum : function () {
    return {tag : "num", E: 0, neg : false, value : [], type:"num"};
  },
  simpleadd : function (a, b) {
    var i, n = Math.max(a.value.length, b.value.length); 
    var c = h.newnum();
    c.E = a.E;
    for (i=0; i < n; i += 1) {
      c.value[i] = (a.value[i] || 0)  + (b.value[i] || 0);
    }
    return c;
  },
  neg : function (a) {
    a.neg = !a.neg;
  },
  simplemult : function (a, b) {
    var i, n = a.value.length, ii, nn = b.value.length; 
    var c = h.newnum();
    c.E = a.E + b.E;
    c.neg = ( (a.neg && b.neg) || (! (!a.neg && !b.neg)) ) ? false : true;
    for (i=0; i < n; i += 1) {
      for (ii = 0; ii < nn; ii += 1) {
        c.value[i+ii] = (c.value[i+ii] || 0) + (a.value[i] || 0)  + (b.value[ii] || 0);
      }
    }
    return c;
  }

};

JS = {
  // using the unlimited precision numbers
  ADD : function (a,b) {
    h.level(a, b);
    var c = h.simpleadd(a,b);
    h.adjust(c);  //make sure a proper number and minimize E
    h.restore(a); h.restore(b);
    return c;
  },
  SUB : function (a,b) {
    h.neg(b);
    var c = JS.ADD(a, b);
    h.neg(b);
    return c;
  },
  MULT : function (a,b) {
    var c = h.simplemult(a,b);
    h.adjust(c);
    return c;
  },
  DIV : function (a,b) {
    // hard, need to implement exact fractions
  }, 
  POW: function (a,b) {
    //...
  },
  // Flow control
  LOOP : function () {
  },
  BRANCH : function () {
  },
  GOTO : function () {
    //?
  },
  //functions, operators
  DEF : function () {
    var env = this;
    var args = Array.prototype.slice(arguments, 0);
    for (i = 0; i < n; i += 1) {
      
    }
  },
  SYM : function (op, bp, associativity) {
    var env = this;
    env.syms[op] = [bp, associativiy];
  },
  ENV : function (a, b) {

  },
  SCOPE : function(a) {
    if (a) {
      a.value
    } else {

    }
  },
  GETVAR : function () {
  }
};


SYM(=, 10, "right")

DEF (a id, =, b ANY) ANY :
  ENV (a, b)
.

SYM(+, 50)

DEF (a num, +, b num) :
  ADD(a, b)
.

SYM(-, 50)

DEF (a num, -, b num) :
  SUB(a, b)
.

SYM(*, 60)

DEF (a num, *, b num) :
  MULT(a,b)
.

SYM(<, 40) 

DEF (a num, <, b num) :
  LT(a, b)
.


 /* 
  "+" :  {
    tag : "JS add",
    types : [ [NUM, NUM], [NUM]
      "num,num" : ["num", function (me, env) {
        return linerun(me.sub[0], env) + linerun(me.sub[1], env);
      }],
      "num+" : ["num", function (me, env) {
        return arrlinerun(me.sub, env, function (a, b) {
          if (typeof a === "undefined") {
            return 0;
          } else if (typeof b === "undefined") {
            return a;
          } else {
            return a + b;
          }
        });
      }]
    }
  }
  
};
*/
