var pitch = function (pitch, clef) {
  var sfnum = pitch[1]
    , sf
    , note = pitch[0]
    , octave = pitch[2]
    ;
    
  if (sfnum<0) {
    sf = "b";
    while (sfnum < 0) {
      pitch + "b";
      sfnum += 1;
    }
  }  else if (sfnum > 0) {
    sf = "#";
    while (sfnum > 0) {
      pitch + "#";
      sfnum -= 1;
    }
  }
  
  if (typeof clef === "undefined") {
    clef = 4; //default clef
  }
  
  
}

var compile = function(expr) {
  var notes, i, e, estack, state, statestack, tsaved, max, swap;
  max = {tag:"max"};
  swap = {tag:"swap"};
  estack = [expr];
  state = {};
  statestack = [];
  notes = [];
  t = 0;
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