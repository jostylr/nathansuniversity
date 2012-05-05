//targeting jsmidgen:  https://github.com/dingram/jsmidgen/blob/master/lib/jsmidgen.js

var pitch = function (pitch, clef, key) {
  var sfnum, note, octave;
    
  if (typeof pitch === 'string') {
    note = pitch.toLowerCase();
    sfnum = 0;
    octave = (pitch === note) ? 0 : 1;
  } else {
    note = pitch.toLowerCase();
    sfnum = pitch[1];
    octave = (pitch === note) ? pitch[2] : pitch[2] + 1;
  }
  
  octave = key[note]+1;
    
  if (sfnum<0) {
    while (sfnum < 0) {
      note += "b";
      sfnum += 1;
    }
  }  else if (sfnum > 0) {
    while (sfnum > 0) {
      note += "#";
      sfnum -= 1;
    }
  }
  
  //numbers should be added first then into string
  note += clef + octave;
  
  return note;
  
};

var makeKey = function (flats, sharps) {
  var ret = {
    'a' : 0
    ,
  }
}


var compile = function(expr) {
  var notes, i, e, estack, state, statestack, tsaved, max, swap;
  max = {tag:"max"};
  swap = {tag:"swap"};
  estack = [expr];
  state = {t:0, 
    clef : 4,
    key : makeKey([], []);
    };
  statestack = [];
  notes = [];
  while (estack.length > 0) {
   e = estack.shift();
   switch (e.tag) {
   case "note":
     notes.push({
       tag: "note",
       pitch: pitch(e.pitch, state.clef),
       start: state.time,
       dur: e.dur*state.durFactor
     });
     // fall through
   case "rest":
     t += e.dur;
     break;
   case "seq":
     estack.concat(e.tree);
     break;
   case "par":
     estack.push(e.tree[0]);
     n = e.tree.length;
     for (i = 1; i < n; i += 1){
      estack.push(swap, e.tree[i]);
     }
     estack.push(max);
     
     tstack.push(t);
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
     n = e.count; 
     for (i = 0; i < n; i += 1) {
       estack.concat(e.tree);
     }
     break;
   default:
     throw ["failuere in compile", e.tag, e];
   }
  }
  return notes;
};