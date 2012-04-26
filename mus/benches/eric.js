var compile1 = (function () {
  var midiPitch = function(textPitch) {
  	var table;
  	table = { a: 9, b: 11, c: 0, d: 2, e: 4, f: 5, g: 7 };
  	return 12 + table[textPitch[0]] + 12 * textPitch[1];
  }

  var compile = function(expr) {
  	var notes, i, e, estack, t, tstack, tsaved;
  	estack = [expr];
  	tstack = [];
  	notes = [];
  	t = 0;
  	while (estack.length > 0) {
  		e = estack.pop();
  		switch (e.tag) {
  		case "note":
  			notes.push({
  				tag: "note",
  				pitch: midiPitch(e.pitch),
  				start: t,
  				dur: e.dur
  			});
  			// fall through
  		case "rest":
  			t += e.dur;
  			break;
  		case "seq":
  			estack.push(e.right);
  			estack.push(e.left);
  			break;
  		case "par":
  			tstack.push(t);
  			estack.push({tag: "max"});
  			estack.push(e.right);
  			estack.push({tag: "swap"});
  			estack.push(e.left);
  			break;
  		case "max":
  			tsaved = tstack.pop();
  			t = Math.max(t, tsaved);
  			break;
  		case "swap":
  			tsaved = tstack.pop();
  			tstack.push(t);
  			t = tsaved;
  			break;
  		case "repeat":
  			for (i = e.count - 1; i >= 0; i--) {
  				estack.push(e.section);
  			}
  			break;
  		default:
  			throw "impossibru";
  		}
  	}
  	return notes;
  };
  
  return compile;
} ());

//tag max, swap created once
var compile2 = (function () {
  var midiPitch = function(textPitch) {
  	var table;
  	table = { a: 9, b: 11, c: 0, d: 2, e: 4, f: 5, g: 7 };
  	return 12 + table[textPitch[0]] + 12 * textPitch[1];
  }

  var compile = function(expr) {
  	var notes, i, e, estack, t, tstack, tsaved, max, swap;
  	max = {tag:"max"};
  	swap = {tag:"swap"};
  	estack = [expr];
  	tstack = [];
  	notes = [];
  	t = 0;
  	while (estack.length > 0) {
  		e = estack.pop();
  		switch (e.tag) {
  		case "note":
  			notes.push({
  				tag: "note",
  				pitch: midiPitch(e.pitch),
  				start: t,
  				dur: e.dur
  			});
  			// fall through
  		case "rest":
  			t += e.dur;
  			break;
  		case "seq":
  			estack.push(e.right);
  			estack.push(e.left);
  			break;
  		case "par":
  			tstack.push(t);
  			estack.push(max);
  			estack.push(e.right);
  			estack.push(swap);
  			estack.push(e.left);
  			break;
  		case "max":
  			tsaved = tstack.pop();
  			t = Math.max(t, tsaved);
  			break;
  		case "swap":
  			tsaved = tstack.pop();
  			tstack.push(t);
  			t = tsaved;
  			break;
  		case "repeat":
  			for (i = e.count - 1; i >= 0; i--) {
  				estack.push(e.section);
  			}
  			break;
  		default:
  			throw "impossibru";
  		}
  	}
  	return notes;
  };
  
  return compile;
} ());

//pitch is a look up table
var compile3 = (function () {
  var midiPitch = (function () {
     var midi, i, num, letter,
         midibase = {a : 33, b : 35, c : 24, d : 26, e : 28, f : 29, g : 31}
       , ret = {}


      for (letter in midibase) {
        for (i = 0; i < 10; i += 1) {
          num = i-1
          midi = midibase[letter] + num*12
          ret[letter+i] = midi
          ret[letter.toUpperCase()+i] = midi
        }
      }

      return ret

   } ())

  var compile = function(expr) {
  	var notes, i, e, estack, t, tstack, tsaved, max, swap;
  	max = {tag:"max"};
  	swap = {tag:"swap"};
  	estack = [expr];
  	tstack = [];
  	notes = [];
  	t = 0;
  	while (estack.length > 0) {
  		e = estack.pop();
  		switch (e.tag) {
  		case "note":
  			notes.push({
  				tag: "note",
  				pitch: midiPitch[e.pitch],
  				start: t,
  				dur: e.dur
  			});
  			// fall through
  		case "rest":
  			t += e.dur;
  			break;
  		case "seq":
  			estack.push(e.right);
  			estack.push(e.left);
  			break;
  		case "par":
  			tstack.push(t);
  			estack.push(max);
  			estack.push(e.right);
  			estack.push(swap);
  			estack.push(e.left);
  			break;
  		case "max":
  			tsaved = tstack.pop();
  			t = Math.max(t, tsaved);
  			break;
  		case "swap":
  			tsaved = tstack.pop();
  			tstack.push(t);
  			t = tsaved;
  			break;
  		case "repeat":
  			for (i = e.count - 1; i >= 0; i--) {
  				estack.push(e.section);
  			}
  			break;
  		default:
  			throw "impossibru";
  		}
  	}
  	return notes;
  };
  
  return compile;
} ());


//max replaced with ternary
var compile4 = (function () {
  var midiPitch = (function () {
     var midi, i, num, letter,
         midibase = {a : 33, b : 35, c : 24, d : 26, e : 28, f : 29, g : 31}
       , ret = {}


      for (letter in midibase) {
        for (i = 0; i < 10; i += 1) {
          num = i-1
          midi = midibase[letter] + num*12
          ret[letter+i] = midi
          ret[letter.toUpperCase()+i] = midi
        }
      }

      return ret

   } ())

  var compile = function(expr) {
  	var notes, i, e, estack, t, tstack, tsaved, max, swap;
  	max = {tag:"max"};
  	swap = {tag:"swap"};
  	estack = [expr];
  	tstack = [];
  	notes = [];
  	t = 0;
  	while (estack.length > 0) {
  		e = estack.pop();
  		switch (e.tag) {
  		case "note":
  			notes.push({
  				tag: "note",
  				pitch: midiPitch[e.pitch],
  				start: t,
  				dur: e.dur
  			});
  			// fall through
  		case "rest":
  			t += e.dur;
  			break;
  		case "seq":
  			estack.push(e.right);
  			estack.push(e.left);
  			break;
  		case "par":
  			tstack.push(t);
  			estack.push(max);
  			estack.push(e.right);
  			estack.push(swap);
  			estack.push(e.left);
  			break;
  		case "max":
  			tsaved = tstack.pop();
  			t = t > tsaved ? t : tsaved; //max
  			break;
  		case "swap":
  			tsaved = tstack.pop();
  			tstack.push(t);
  			t = tsaved;
  			break;
  		case "repeat":
  			for (i = e.count - 1; i >= 0; i--) {
  				estack.push(e.section);
  			}
  			break;
  		default:
  			throw "impossibru";
  		}
  	}
  	return notes;
  };
  
  return compile;
} ());


//put objects so that they are created only once
var compile5 = (function () {
  var midiPitch = (function () {
     var midi, i, num, letter,
         midibase = {a : 33, b : 35, c : 24, d : 26, e : 28, f : 29, g : 31}
       , ret = {}


      for (letter in midibase) {
        for (i = 0; i < 10; i += 1) {
          num = i-1
          midi = midibase[letter] + num*12
          ret[letter+i] = midi
          ret[letter.toUpperCase()+i] = midi
        }
      }

      return ret

   } ())

   var tagMax = {tag:"max"};
 	 var tagSwap = {tag:"swap"};
 	 var estack = [];
 	 var tstack = [];
 	

  var compile = function(expr) {
  	var notes, i, e, t, tsaved;
  	notes = [];
  	t = 0;
  	estack.push(expr);
  	while (estack.length > 0) {
  		e = estack.pop();
  		switch (e.tag) {
  		case "note":
  			notes.push({
  				tag: "note",
  				pitch: midiPitch[e.pitch],
  				start: t,
  				dur: e.dur
  			});
  			// fall through
  		case "rest":
  			t += e.dur;
  			break;
  		case "seq":
  			estack.push(e.right);
  			estack.push(e.left);
  			break;
  		case "par":
  			tstack.push(t);
  			estack.push(tagMax);
  			estack.push(e.right);
  			estack.push(tagSwap);
  			estack.push(e.left);
  			break;
  		case "max":
  			tsaved = tstack.pop();
  			t = t > tsaved ? t : tsaved;
  			break;
  		case "swap":
  			tsaved = tstack.pop();
  			tstack.push(t);
  			t = tsaved;
  			break;
  		case "repeat":
  			for (i = e.count - 1; i >= 0; i--) {
  				estack.push(e.section);
  			}
  			break;
  		default:
  			throw "impossibru";
  		}
  	}
  	return notes;
  };
  
  return compile;
} ());

// localize outer objects
var compile6 = (function () {
  var midiPitchO = (function () {
     var midi, i, num, letter,
         midibase = {a : 33, b : 35, c : 24, d : 26, e : 28, f : 29, g : 31}
       , ret = {}


      for (letter in midibase) {
        for (i = 0; i < 10; i += 1) {
          num = i-1
          midi = midibase[letter] + num*12
          ret[letter+i] = midi
          ret[letter.toUpperCase()+i] = midi
        }
      }

      return ret

   } ())

     var tagMaxO = {tag:"max"};
  	 var tagSwapO = {tag:"swap"};
  	 var estackO = [];
  	 var tstackO = [];


  var compile = function(expr) {
   	var notes, i, e, t, tsaved;
   	var tagMax = tagMaxO;
   	var tagSwap = tagSwapO;
   	var estack = estackO ;
   	var tstack = tstackO;
   	var midiPitch = midiPitchO;
   	notes = [];
  	t = 0;
  	estack.push(expr);
  	while (estack.length > 0) {
  		e = estack.pop();
  		switch (e.tag) {
  		case "note":
  			notes.push({
  				tag: "note",
  				pitch: midiPitch[e.pitch],
  				start: t,
  				dur: e.dur
  			});
  			// fall through
  		case "rest":
  			t += e.dur;
  			break;
  		case "seq":
  			estack.push(e.right);
  			estack.push(e.left);
  			break;
  		case "par":
  			tstack.push(t);
  			estack.push(tagMax);
  			estack.push(e.right);
  			estack.push(tagSwap);
  			estack.push(e.left);
  			break;
  		case "max":
  			tsaved = tstack.pop();
  			t = t > tsaved ? t : tsaved;
  			break;
  		case "swap":
  			tsaved = tstack.pop();
  			tstack.push(t);
  			t = tsaved;
  			break;
  		case "repeat":
  			for (i = e.count - 1; i >= 0; i--) {
  				estack.push(e.section);
  			}
  			break;
  		default:
  			throw "impossibru";
  		}
  	}
  	return notes;
  };
  
  return compile;
} ());

//reduce push/pop
var compile7 = (function () {
  var midiPitch = (function () {
     var midi, i, num, letter,
         midibase = {a : 33, b : 35, c : 24, d : 26, e : 28, f : 29, g : 31}
       , ret = {}


      for (letter in midibase) {
        for (i = 0; i < 10; i += 1) {
          num = i-1
          midi = midibase[letter] + num*12
          ret[letter+i] = midi
          ret[letter.toUpperCase()+i] = midi
        }
      }

      return ret

   } ())

   var tagMaxO = {tag:"max"};
 	 var tagSwapO = {tag:"swap"};
 	 var estackO = [];
 	 var tstackO = [];
 	

  var compile = function(expr) {
  	var notes, i, e, t, tsaved;
  	var tagMax = tagMaxO;
  	var tagSwap = tagSwapO;
  	var estack = estackO ;
  	var tstack = tstackO;
 	 
  	notes = [];
  	t = 0;
  	e = expr;
  	while (e) {
  		switch (e.tag) {
  		case "note":
  			notes.push({
  				tag: "note",
  				pitch: midiPitch[e.pitch],
  				start: t,
  				dur: e.dur
  			});
  			// fall through
  		case "rest":
  			t += e.dur;
  			e = estack.pop();
  			break;
  		case "seq":
  			estack.push(e.right);
  			e = e.left;
  			break;
  		case "par":
  			tstack.push(t);
  			estack.push(tagMax);
  			estack.push(e.right);
  			estack.push(tagSwap);
  			e = e.left;
  			break;
  		case "max":
  			tsaved = tstack.pop();
  			t = t > tsaved ? t : tsaved;
  			e = estack.pop()
  			break;
  		case "swap":
  			tsaved = tstack.pop();
  			tstack.push(t);
  			t = tsaved;
  			e = estack.pop();
  			break;
  		case "repeat":
  			for (i = e.count - 2; i >= 0; i--) {
  				estack.push(e.section);
  			}
  			e = e.section;
  			break;
  		default:
  			throw "impossibru";
  		}
  	}
  	return notes;
  };
  
  return compile;
} ());


//mark normal
var compile8 = (function () {
  var compile = function (musexpr) {
      var result = [];
      helper(0, result, musexpr);
      return result;
  };

  /*
    This helper function does two things at a time
     - it appends the NOTE bytecode to the end of result
     - it returns the ending time
  */
  var helper = function (time, result, expr) {
      switch(expr.tag){

        case 'seq':
          //Take endtime as new start time
          time = helper(time, result, expr.left);
          return helper(time, result, expr.right);

        case 'par':
          var t0 = helper(time, result, expr.left);
          var t1 = helper(time, result, expr.right);
          // Take maximum of two parrelel pieces
          return Math.max(t0, t1);  

        case 'repeat':
          for(var i=expr.count-1; 0<=i; i--){
            time = helper(time, result, expr.section);
          }
          return time;

        case 'rest':
          return time + expr.dur;

        case 'note':
          result.push(
            { tag: 'note', pitch: convertPitch(expr.pitch), start: time, dur: expr.dur}
          );
          return time + expr.dur;

        default:
          return time;
      }
  };

  /*
    Converter for pitches
  */
  var convertPitch = function(pitch) {
      var letterPitches = { c: 12, d: 14, e: 18, f: 17, g: 19, a: 21, b: 23 };
      return letterPitches[pitch[0]] +
             12 * parseInt(pitch[1]);
  }
  
  return compile;
} ());

//mark fastest
var compile9 = (function () {
  var compile = function (musexpr) {
      var result = [];
      helper(0, result, musexpr);
      return result;
  };

  /*
    This helper function does two things at a time
     - it appends the NOTE bytecode to the end of result
     - it returns the ending time
  */
  var helper = function (time, result, expr) {
      switch(expr.tag){

        case 'seq':
          //Take endtime as new start time
          time = helper(time, result, expr.left);
          return helper(time, result, expr.right);

        case 'par':
          var t0 = helper(time, result, expr.left);
          var t1 = helper(time, result, expr.right);
          // Take maximum of two parrelel pieces
          return t0>t1? t0 : t1;
          

        case 'repeat':
          for(var i=expr.count-1; 0<=i; i--){
            time = helper(time, result, expr.section);
          }
          return time;

        case 'rest':
          return time + expr.dur;

        case 'note':
          result.push(
            { tag: 'note', pitch: convertPitch[expr.pitch], start: time, dur: expr.dur}
          );
          return time + expr.dur;

        default:
          return time;
      }
  };

  /*
    Converter for pitches
  */
  var convertPitch = (function () {
    var midi, i, num, letter,
        midibase = {a : 33, b : 35, c : 24, d : 26, e : 28, f : 29, g : 31}
      , ret = {}


     for (letter in midibase) {
       for (i = 0; i < 10; i += 1) {
         num = i-1
         midi = midibase[letter] + num*12
         ret[letter+i] = midi
         ret[letter.toUpperCase()+i] = midi
       }
     }

     return ret

  } ())
  
  return compile;
}())


var longMus = (function (n) {
    var i = 0
     , tree = {tag : 'seq', left: {}, right : {}}
     , stack = [tree.left, tree.right]
     , cur
    ;

     cur = stack.pop();
     while (i < n && cur) {
       cur.tag = 'par'; //(Math.random() < 0.5) ? 'seq' : 'par';
       cur.left = {};
       cur.right = {};
       stack.unshift(cur.right);
       stack.unshift(cur.left);
       cur = stack.pop();
       i += 1;
     }
     
     while (cur) {
       cur.tag = "note";
       cur.pitch = "c4";
       cur.dur = 250;
       cur = stack.pop();
     }
    
    return tree;
    
} (1e3));


var longMus = (function (n) {
    var i = 0
     , tree = {tag : 'seq', left: {}, right : {}}
     , stack = [tree.left, tree.right]
     , cur
    ;

     cur = stack.pop();
     while (i < n && cur) {
       cur.tag = 'par';
       cur.left = {};
       cur.right = { tag: 'note', pitch: 'd4', dur: 500 };
       //stack.unshift(cur.right);
       stack.unshift(cur.left);
       cur = stack.pop();
       i += 1;
     }
     
     while (cur) {
       cur.tag = "note";
       cur.pitch = "c4";
       cur.dur = 250;
       cur = stack.pop();
     }
    
    return tree;
    
} (1e5));


var Benchmark = require('benchmark');

var suite = new Benchmark.Suite;

suite
  .add('original', function () {
    compile1(longMus)
  })
  .add('saved max swap objects', function () { 
    compile2(longMus)
  })
  .add('pitch table added', function () { 
    compile3(longMus)
  })
  .add('ternary added', function () { 
    compile4(longMus)
  })
  .add('object creation in outer scope', function () { 
    compile5(longMus)
  })
  .add('localize outer scope', function () { 
    compile6(longMus)
  })
  .add('push/pop reduction', function () { 
    compile7(longMus)
  })
  .add('mark original', function () { 
    compile8(longMus)
  })
  .add('mark fast', function () { 
    compile9(longMus)
  })
  
  .on('cycle', function(event, bench) {
    console.log(String(bench));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'));
  })
  .run()

