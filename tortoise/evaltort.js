/*globals module, require, console, exports*/

var _ = require('underscore');
var util = require('util');

var debugF;

var level = 0;

var initenv;

var arith; 

var lookup = function (env, v) {
  while (env) {
    if (env.vars.hasOwnProperty(v) ) {
      debugF.ret.lookup.push(v, env.level);
      return env.vars[v];
    } else {
      env = env.parent;
    }
  }
  throw "Lookup: no such var " + v;
};

var store = function (env, name, value) {
  while (env) {
    if (env.vars.hasOwnProperty(name) ) {
      debugF.ret.lookup.push(name, env.level);
      env.vars[name] = value;
      return true; 
    } else {
      env = env.parent;
    }
  }
  throw "Assignment: no such var " + name;  
};


var newenv = function (parent, names, values) {
  var ret = {};
  var i, n, v;
  ret.parent = parent;
  ret.level = parent.level + 1; 
  v = ret.vars = {"arguments" : values};
  n = names.length;
  for (i = 0; i < n; i += 1) {
    v[names[i]] = values[i];
  }
  
  return ret;
};

var evalTort = function (statements, initialvars) {
  var cur, env, temp, i, f
    , maxtimes = this.maxtimes || 1e4
    , numtimes = 0
    , stack = [] //always an array
    , values = [[]]
  ;



  stack.push.apply(stack, statements);

  debugF = {
    ret : {
      stack: [],
      values : [],
      lookup : []
    },
    log : (this && this.hasOwnProperty('debugF')) ? console.log : function () {}
  };
  
  if (this && this.hasOwnProperty('debugF'))  {
    this.debugF = debugF;
  }
  
  //flag objects
  //var 
  
  //initial environment
  env = initenv(initialvars || {});
           
  while (stack.length !== 0) {
    
    if (numtimes > maxtimes) {
      throw "too many times";
    } else {
      numtimes += 1;
    }
    
    cur = stack.pop();
    
    debugF.log(cur);
    
    debugF.ret.stack.push(cur);
   
    if (_.isNumber(cur)  ) {
      values[0].push(cur);
      debugF.ret.values.push(cur);
      continue;
    }
    if (!cur.hasOwnProperty("tag") ) {
      throw "tag not present" + util.inspect(cur.tag, false, null);
    }
    
    if (arith.hasOwnProperty(cur.tag)) {
      temp = values.shift();
      temp = arith[cur.tag](temp[0], temp[1]);
      values[0].push(temp);
      debugF.ret.values.push(temp);
      continue;
    }

    switch (cur.tag) {
      case 'op' :
        values.unshift([]);    
        stack.push({tag: cur.op}, cur.right, cur.left);
      break;
      case 'repeat' :
        values.unshift([]);    
        stack.push({tag : "dorepeat", body: cur.body}, cur.n);
      break;
      case 'dorepeat' :
        temp = values.shift()[0];
        for (i = 0; i < temp; i += 1) {
          stack.push.apply(stack, cur.body);
        }
      break;
      case 'if' :
        values.unshift([]);    
        stack.push({tag : "cond", body : cur.body}, cur.cond);
      break;
      case 'cond' :
        temp = values.shift();
        if (temp[0] === true) {
          stack.push.apply(stack, cur.body);
        }
      break;
      case 'identifier' :
        stack.push(lookup(env, cur.name));
        //debugF.ret.values.push(cur.name);
      break;
      case 'define' :
        if (env.vars.hasOwnProperty(cur.name)) {
          throw "variable already defined: "+ cur.name;
        } else {
          env.vars[cur.name] = 0;
        }
        store(env, cur.name, {args : cur.args, body: cur.body, lex : env});
      break;
      case 'call' :
        temp = lookup(env, cur.name);
        stack.push({tag : "docall",  f: temp});
        values.unshift([]);
        stack.push.apply(stack, cur.args);
      break;
      case 'docall' :
        f = cur.f;
        temp = values.shift();
        temp.reverse(); //values are in wrong order? 
        if (_.isFunction(f.body)) {
          // put body as function, ignore args
          // the this for the function will be the environment
          values[0].push(f.body.apply(f.lex, temp));
        } else {
          stack.push({tag: "switchenv", env: env});
          env = newenv(f.lex, f.args, temp); // (environment, names of variables, array of values)
          values.unshift([]);
          stack.push({tag: "dof"});
          stack.push.apply(stack, f.body);          
        }
      break;
      case "dof" :  //get last value from f call and push on to values above level
        temp = values.shift().pop();
        values[0].push(temp);
      break;
      case "switchenv" : 
        env = cur.env;
      break;
      case 'var' :
        if (env.vars.hasOwnProperty(cur.name)) {
          throw "variable already defined: "+ cur.name;
        } else {
          env.vars[cur.name] = 0;
        }
      break;
      case 'assignment' :
        values.unshift([]);
        stack.push({tag: "doassign", name : cur.name}, cur.value);
      break;
      case 'doassign' :
        temp = values.shift()[0];
        //debugF.log("doassign", cur.name, temp, stack.length);
        store(env, cur.name, temp);   
      break;
      case 'string' :
        values[0].push(cur.value);
      break;
      default : 
        throw "unknown tag: " + cur.tag;
    }
    
  }
  
        
 return (env.ret) ? env.ret() : values[0][0];
  
};

arith = {
   '+' : function (l, r) {return l +  r;},
   '-' : function (l, r) {return l -  r;},
   '*' : function (l, r) {return l *  r;},
   '/' : function (l, r) {return l /  r;},
   '<' : function (l, r) {return l <  r;},
   '>' : function (l, r) {return l >  r;},
  '<=' : function (l, r) {return l <= r;},
  '>=' : function (l, r) {return l >= r;},
  '!=' : function (l, r) {return l !== r;},
  '==' : function (l, r) {return l === r;}
};





initenv = function (initialenv) {
  initialenv.parent = null;
  initialenv.level = 0;
  initialenv.vars = initialenv.vars || {};
  return initialenv;
};


module.exports = evalTort;
