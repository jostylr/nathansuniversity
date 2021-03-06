/*globals module, require, console, exports, $*/
/*jshint laxcomma: true*/

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


var step = function (stack, env, values) {
  var temp, i, f;

  var cur = stack.pop();

    debugF.log(cur);
    
    debugF.ret.stack.push(cur);
   
    if (_.isNumber(cur)  ) {
      values[0].push(cur);
      debugF.ret.values.push(cur);
      return env;
    }
    if (!cur.hasOwnProperty("tag") ) {
      throw "tag not present" + util.inspect(cur.tag, false, null);
    }
    
    if (arith.hasOwnProperty(cur.tag)) {
      temp = values.shift();
      temp = arith[cur.tag](temp[0], temp[1]);
      values[0].push(temp);
      debugF.ret.values.push(temp);
      return env;
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

    return env;
};

var globalEnv = {};

var startTurtle = function () {

};

var step = function ()

var evalTort = function (statements, turtle) {
  var env
    , stack = [] //always an array
    , values = [[]]
    ;



  stack.push.apply(stack, statements);

  
  //flag objects
  //var 
  
  //initial environment
  env = initenv(turtle);
  
  turtle = env.turtle; 
         
  while (stack.length !== 0) {
    
    env = step(stack, env, values);


    
  }
  
        
 return (turtle.steps.length >= 3) ? turtle.ret() : values[0][0];
  
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





initenv = function (turtle) {
  turtle =  turtle || {
    current : [0, 0, 90],
    com : function (c) {
      this.steps.push(c);
    },
    steps : [{tag : "position", x: 0,  y : 0}, {tag : "angle", value : 90}],
    ret : function () {
      return this.steps;
    }
  };

  var cos = function (a) {
    return Math.cos(Math.PI*a/180);
  };

  var sin = function (a) {
    return Math.sin(Math.PI*a/180);
  };
  
  return {
    turtle : turtle,
    vars : {
      cos : {
        lex : turtle, 
        body : cos
      },
      sin : {
        lex : turtle, 
        body : sin
      },
      print : {
        lex : turtle, 
        body : function (a) {
          $("#log").append("<li>"+a+"</li>");
        }
      },
      forward : {
        lex : turtle,
        body : function (d) {
          //[x, y, angle]
          var a = this.current[2] 
            , x = Math.floor(this.current[0] + cos(a)*d + 0.5)
            , y = Math.floor(this.current[1] + sin(a)*d + 0.5)
            ;
            
          this.current = [x, y, a];
          this.com({tag : "position", x : x, y : y});
          return this;
      } // body
     },  //forward
     left : {
       lex : turtle,
       body : function (a) {
         this.current[2] +=  a;
         this.com({tag : "angle", value : this.current[2]});
         return this;
       }
     },
     right : {
       lex : turtle,
       body : function (a) {
         this.current[2] -=  a;
         this.com({tag : "angle", value : this.current[2]});
         return this;
       }
     },     
     back : {
        lex : turtle,
        body : function (d) {
          //[x, y, angle]
          var a = this.current[2] 
          , x = Math.floor(this.current[0] - cos(a)*d + 0.5)
          , y = Math.floor(this.current[1] - sin(a)*d + 0.5)
            ;
            
          this.current = [x, y, a];
          this.com({tag : "position", x: x, y : y});
          return this;
      } // body
     },  //back
     penup : {
       lex : turtle,
       body : function () {
          this.com({tag: "penup"});         
       }
     },
     pendown : {
       lex : turtle,
       body : function () {
         this.com({tag: "pendown"});         
       }       
     },
     eraser : {
       lex : turtle,
       body : function () {
         this.com({tag: "eraser"});
       }
     },
     home : {
       lex : turtle,
        body : function () {
          this.current = [0,0,90];
          this.com({tag : "position", x: 0, y : 0});
          this.com({tag : "angle", value : 90});
        }
     },
     clear : {
       lex : turtle,
        body : function () {
          this.com({tag: "clear"});
          this.com({tag : "position", x : 0,  y :0});
          this.com({tag : "angle", value : 90});
          this.current = [0,0,90];
        }
     },
     color : {
       lex : turtle,
        body : function (i) {
          this.com({tag: "setColor", value: i});
        }
     },
     speed : {
       lex : turtle,
        body : function (speed) { // in pixel/ms?
          this.com({tag : "setSpeed", value : speed});          
        }
     },
     thick :  {
       lex : turtle,
       body : function (thick) {
         this.com({tag: "setThick", value : thick});
       }
     }
    }, //vars
    parent : null,
    level : level++
  };
};


module.exports = evalTort;
