// returns an object for midi conversion
var pitchMidi = (function () {
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


var compile2 = function (expr) {
  var cur = {expr : expr, time : 0 }
    , notes = []
    , stack = []
    , i = 1
  
  while (cur) {
    expr = cur.expr
    switch (expr.tag) {
      case 'par' : 
        switch (cur.state) {
          case 'right' : 
            cur.state = 'done'
            cur.leftTime = cur.time
            if (expr.right) {
              stack.push(cur)
              cur = {expr : expr.right, time : cur.original}              
            }
          break
          case 'done' : 
            temp = Math.max(cur.time, cur.leftTime)
            cur = stack.pop()
            if (cur) {cur.time = temp}
          break
          default : //left
            cur.state = 'right'
            cur.original = cur.time
            if (expr.left) {
              stack.push(cur)
              cur = {expr : expr.left, time : cur.time}
            } 
        }
      break
      case 'seq' :
        switch (cur.state) {
          case 'right' : 
            cur.state = 'done'
            if (expr.right) {
              stack.push(cur)
              cur = {expr : expr.right, time : cur.time}              
            }
          break
          case 'done' : 
            temp = cur.time
            cur = stack.pop()
            if (cur) {cur.time = temp}
          break
          default : //left
            cur.state = 'right'
            if (expr.left) {
              stack.push(cur)
              cur = {expr : expr.left, time : cur.time}
            } 
        }
      break
      case 'repeat' :
        temp = cur.time
        if (typeof cur.i === 'undefined') {
          cur.i = 1
          stack.push(cur)
          cur = {expr : expr.section, time : temp}
        } else if (cur.i < expr.count) {
          cur.i += 1
          stack.push(cur)
          cur = {expr : expr.section, time : temp}
        } else { //done
          cur = stack.pop()
          if (cur) { cur.time = temp }
        }
      break
      case 'note' :
        notes.push({tag : 'note', pitch : pitchMidi[expr.pitch], start : cur.time, dur : expr.dur })
        cur = stack.pop()
        if (cur) {cur.time += expr.dur}
      break
      case 'rest' :
        cur = stack.pop()
        if (cur) {cur.time += expr.dur}
      break 
      default : 
        console.log("error", cur)
    } //cur.tag
    
    
    
  }
  
  return notes
  
}

// maybe some helper functions
var arrayNotes = function (arrnotes, justnotes, time) {
    var i;
    var n = arrnotes.length;
    var ii;
    var nn; 
    var cur;
    var temptime;
    var oldtime;
    
    for (i = 0; i < n; i += 1) {
        cur = arrnotes[i];
        if (cur.length) { //crappy array test
          nn = cur.length;
          oldtime = time;
          for (ii = 0; ii < nn; ii += 1) {
            temptime = arrayNotes(cur[ii], justnotes, oldtime); 
            time = (time > temptime) ? time : temptime; 
          }
        } else {
          if (cur.tag === 'note') {
            justnotes.push(cur);
            cur.start = time;
          }
          time += cur.dur;
        }
    }
    return time;
};

var clone = function (obj) {
  var ret = {};
  var key; 
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      ret[key] = obj[key];      
    }
  }
  return ret;
};


var midibase = {
    a : 33, b : 35, c : 24, d : 26, e : 28, f : 29, g : 31
 };
 
 

var pitchMidiF = function (pitch) {
  var midi; 
  var letter = pitch[0].toLowerCase();
  var num = pitch[1];
  
  num = num - 1; 
  
  midi = midibase[letter] + num*12; 

  return midi;
  }


var makeNotes = function (musexpr, arrnote) {
    var partop, temp, i , n;
    
    if (!musexpr) {
        return;
    }
    if (musexpr.tag === 'note')  {
      temp = clone(musexpr);
      temp.pitch = pitchMidiF(temp.pitch);
      arrnote.push(temp);
      return;
    }
    
    if (musexpr.tag === 'rest') {
      arrnote.push(clone(musexpr));
      return;      
    }
    
    if (musexpr.tag === 'seq') {
        if (musexpr.hasOwnProperty('left')) {
            makeNotes(musexpr.left, arrnote);
        }
        if (musexpr.hasOwnProperty('right')) {
            makeNotes(musexpr.right, arrnote);
        }
    }

    if (musexpr.tag === 'par') {
      partop = [];
      arrnote.push(partop);
      if (musexpr.hasOwnProperty('left')) {
        temp = [];
        partop.push(temp);
        makeNotes(musexpr.left, temp);
      }
      if (musexpr.hasOwnProperty('right')) {
        temp = [];
        partop.push(temp);
        makeNotes(musexpr.right, temp);
      }
      
    }
    
    if (musexpr.tag === 'repeat') {
      n = musexpr.count;
      for (i = 0; i < n; i += 1) {
        makeNotes(musexpr.section, arrnote);
      }
    }
    
    
    return;
    
};

var compile1 = function (musexpr) {
    // your code here
    if (! musexpr) {
        return [];
    }
    var arrnote = [];
    makeNotes(musexpr, arrnote);
    
    var ret = [];
    arrayNotes(arrnote, ret, 0);
    return ret;
};



var compile3 = function (musexpr) {
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

var midiPitch = function(textPitch) {
	var table;
	table = { a: 9, b: 11, c: 0, d: 2, e: 4, f: 5, g: 7 };
	return 12 + table[textPitch[0]] + 12 * textPitch[1];
}

var endTime = function(t0, expr) {
	switch (expr.tag) {
	case "note":
		return t0 + expr.dur;
	case "rest":
		return t0 + expr.dur;
	case "seq":
		return endTime(endTime(t0, expr.left), expr.right);
	case "par":
		return Math.max(endTime(t0, expr.left), endTime(t0, expr.right));
	case "repeat":
		return t0 + expr.count * endTime(0, expr.section);
	}
	throw "impossibru";
};

var compile4 = function(expr) {
	var s, x, notes, t, e;
	s = [{start: 0, expr: expr}];
	notes = [];
	while (s.length > 0) {
		x = s.pop();
		t = x.start;
		e = x.expr;
		switch (e.tag) {
		case "note":
			notes.push({
				tag: "note",
				pitch: midiPitch(e.pitch),
				start: t,
				dur: e.dur
			});
			break;
		case "rest":
			break;
		case "seq":
			s.push({start: endTime(t, e.left), expr: e.right});
			s.push({start: t, expr: e.left});
			break;
		case "par":
			s.push({start: t, expr: e.right});
			s.push({start: t, expr: e.left});
			break;
		case "repeat":
			if (e.count > 1) {
				s.push({
					start: endTime(t, e.section),
					expr: {
						tag: "repeat",
						section: e.section,
						count: e.count - 1
					}
				});
			}
			s.push({start: t, expr: e.section});
			break;
		default:
			throw "impossibru";
		}
	}
	return notes;
};


// converts notes to midi numbers
var note_to_midi_mapper = pitchMidiF//require('./note_mapping.js').note_to_midi_mapper;

// computes durations of mus expression segments
var end_time = function(init_time, expr) {
  var left, right;
  switch (expr.tag) {
    case 'note': // base case
      return init_time + expr.dur;
    case 'rest': // another base case
      return init_time + expr.dur;
    case 'seq': // seq case
      return end_time(end_time(init_time, expr.left), expr.right);
    case 'par': // par case
      left = end_time(init_time, expr.left);
      right = end_time(init_time, expr.right);
      return Math.max.apply(null, [left, right]);
    case 'repeat': // segment repetion
      return init_time + expr.count * end_time(0, expr.section);
  }
};

// flattens out the mus expression tree to an array of note objects
var compile_aux = function(init_time, expr) {
  var left, right, repeat_acc = [], section_dur;
  switch (expr.tag) {
    case 'note': // base case
      return [{tag: 'note', pitch: expr.pitch, start: init_time, dur: expr.dur}];
    case 'rest': // another base case
      return [{tag: 'rest', start: init_time, dur: expr.dur}];
    case 'seq': // seq case
      left = compile_aux(init_time, expr.left);
      right = compile_aux(end_time(init_time, expr.left), expr.right);
      return left.concat(right);
    case 'par': // par case
      left = compile_aux(init_time, expr.left);
      right = compile_aux(init_time, expr.right);
      return left.concat(right);
    case 'repeat': // repeat case
      section_dur = end_time(0, expr.section); // find out the duration of the repeating section
      for (var i = 0, len = expr.count; i < len; i++) { // accumulate
        repeat_acc = repeat_acc.concat(compile_aux(init_time + i * section_dur, expr.section));
      }
      return repeat_acc;
  }
};

// converts the compiled note array to another one in place that has
// midi pitch numbers instead of notes
var transform_to_midi = function(notes) {
  for (var i = 0, len = notes.length; i < len; i++) {
    if (notes[i].pitch) {
      notes[i].pitch = note_to_midi_mapper(notes[i].pitch);
    }
  }
  return notes;
};

var compile5 = function(expr, midi_conversion) {
  var convert = midi_conversion || false; // see if the user wants the compiled output in terms of midi notes
  var compiled_notes = compile_aux(0, expr);
  if (convert) { // convert to midi notes
    return transform_to_midi(compiled_notes);
  }
  return compiled_notes;
};


//testing
var simple = {
    tag : 'seq'
  , left : {tag : 'note', pitch : 'a4', dur : 125}
  , right : {tag : 'note', pitch : 'b9', dur : 250}
}

var repeat = {
    tag : 'repeat'
  , section : simple
  , count : 3
}

var melody_mus = 
    { tag: 'seq',
      left: 
       { tag: 'seq',
         left: { tag: 'note', pitch: 'a4', dur: 250 },
         right: {
           tag : 'par',
           left : { tag: 'note', pitch: 'b4', dur: 250 },
           right : {
             tag : 'seq',
              left : {tag : 'note', pitch : 'g5', dur : 100},
              right : {tag : 'rest', dur : 300}
           }
          }
      },
      right:
       { tag: 'seq',
         left: { tag: 'repeat',
           section: { 
             tag : 'seq', 
             left : {tag: 'note', pitch: 'c4', dur: 250 },
             right : { tag: 'rest',  dur: 500 }
             }, 
           count: 3 },
         right: { tag: 'note', pitch: 'd4', dur: 500 } } 
};

var longMusWide = (function (n) {
    var i = 0
     , tree = {tag : 'seq', left: {}, right : {}}
     , stack = [tree.left, tree.right]
     , cur
    ;

     cur = stack.pop();
     while (i < n && cur) {
       cur.tag = 'seq';
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
    
} (1000));

var longMusDeep = (function (n) {
    var i = 0
     , tree = {tag : 'seq', left: {}, right : {}}
     , stack = [tree.left, tree.right]
     , cur
    ;

     cur = stack.pop();
     while (i < n && cur) {
       cur.tag = 'seq';
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
    
} (1000));


var Benchmark = require('benchmark');

var suite = new Benchmark.Suite;

suite
  .add('my recurse', function () {
    compile1(longMusWide)
  })
  .add('my nonrecurse', function () { //https://github.com/jostylr/nathansuniversity/tree/master/mus
    compile2(longMusWide)
    
  })
  .add('mark recurse', function () { // https://github.com/MarkBiesheuvel/NathansUniversity/blob/master/lesson2/MUS%20compiler.js
    compile3(longMusWide)
    
  })
  .add('non-recurse, ebb', function () { //https://github.com/ebb/nathanu/blob/master/hw2/mus.html
    compile4(longMusWide)
    
  })
  .add('n^2 recurse, davidk01', function () { //https://github.com/davidk01/NathansUniversityStuff/tree/master/mus_compiler 
    compile5(longMusWide)
    
  })
  
  .on('cycle', function(event, bench) {
    console.log(String(bench));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'));
  })
  .run()

suite = new Benchmark.Suite;

console.log("DEEP")

suite
  .add('my recurse', function () {
    compile1(longMusDeep)
  })
  .add('my nonrecurse', function () { //https://github.com/jostylr/nathansuniversity/tree/master/mus
    compile2(longMusDeep)

  })
  .add('mark recurse', function () { // https://github.com/MarkBiesheuvel/NathansUniversity/blob/master/lesson2/MUS%20compiler.js
    compile3(longMusDeep)

  })
  .add('non-recurse, ebb', function () { //https://github.com/ebb/nathanu/blob/master/hw2/mus.html
    compile4(longMusDeep)

  })
  .add('n^2 recurse, davidk01', function () { //https://github.com/davidk01/NathansUniversityStuff/tree/master/mus_compiler 
    compile5(longMusDeep)

  })

  .on('cycle', function(event, bench) {
    console.log(String(bench));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'));
  })
  .run()


/*
console.log(melody_mus);
console.log(compile(melody_mus));
console.log(compile(melody_mus, true));
console.log(melody_note);

console.log(compile1(simple))
console.log(compile1(repeat))
console.log(compile1(melody_mus))

console.log(compile2(simple))
console.log(compile2(repeat))
console.log(compile2(melody_mus))

console.log(compile3(simple))
console.log(compile3(repeat))
console.log(compile3(melody_mus))

console.log(compile4(simple))
console.log(compile4(repeat))
console.log(compile4(melody_mus))

console.log(compile5(simple, true))
console.log(compile5(repeat, true))
console.log(compile5(melody_mus, true))
*/