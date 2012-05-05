var evalScheem = function (expr, env) {
  
  var stack = [expr];
  
  var values = [[]];
  var val = values[0];
  
  while (stack.length) {
    
    cur = stack.shift();
    
    
    if (typeof cur === 'number') {
      if (typeof value !== 'undefined') {
        val.push( value );
      }
      value = cur;
    } else {
      switch (cur[0]) {
        case '+' : 
          stack.concat(cur.slice(1));
          stack.push([])
      }
      
      
      
    }
    
    
  }
  
  
    // Numbers evaluate to themselves
    if (typeof expr === 'number') {
        return expr;
    }
    
    
    // Look at head of list for operation
    switch (expr[0]) {
        case '+':
            return evalScheem(expr[1], env) +
                   evalScheem(expr[2], env);
        case 'quote':
            return expr[1];
        case 'fail' :
            throw 42;
    }
};

module.exports.evalScheem = evalScheem;