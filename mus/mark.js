var compile1 = (function () {
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
}())


var compile2 = (function () {
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
}())

var compile1 = (function () {
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
}())


var compile3 = (function () {
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

var compile4 = (function () {
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
    
} (10000));

var Benchmark = require('benchmark');

var suite = new Benchmark.Suite;

suite
  .add('original', function () {
    compile1(longMus)
  })
  .add('ternary', function () { 
    compile2(longMus)
  })
  .add('pitch', function () { 
    compile3(longMus)
  })
  .add('pitch and ternary', function () { 
    compile4(longMus)
  })
  
  .on('cycle', function(event, bench) {
    console.log(String(bench));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'));
  })
  .run()

