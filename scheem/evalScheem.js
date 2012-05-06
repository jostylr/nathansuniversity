/*globals module, require, console, exports*/

var h = {
  add : function (arr) {
    var i
      , sum = 0
      , n = arr.length
    ;
    
    for (i = 0; i < n; i += 1) {
      sum += arr[i];
    }

    return sum;
  }
  , mult: function (arr) {
    var i
      , n = arr.length
      , prod = 1
    ;
      
    for (i = 0; i < n; i += 1) {
      prod *= arguments[i];
    }

    return prod;

  }
  , quote: function (arr) {
    return arr[0];
  }
};


var evalScheem = function (expr, env) {
  var cur
    , stack = [expr]
    , values = [[]]
  ;

  console.log(expr);
  
  while (stack.length) {
    
    cur = stack.pop();
    
    console.log(cur);
    
    if (typeof cur === 'number') {
      values[0].push( cur );
    } else if (typeof cur === 'string') {
      if (h.hasOwnProperty(cur) ) {
        values[0].push(h[cur](values.shift() ) );        
      }
    } else {
      //every list should finish with unshifting the array back and pushing on the value
      values.unshift([]);
      switch (cur[0]) {
        case '+' : 
          stack.push('add');
          stack.concat(cur.slice(1).reverse() );
        break;
        case 'quote' :
          stack.push('quote', cur[1]);
        break;
      }
    }
    
    
  }
  
  console.log(values);
  
  return values[0][0];
  
};



module.exports.evalScheem = evalScheem;