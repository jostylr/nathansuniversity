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
    a : 33
  , b : 35
  , c : 24
  , d : 26
  , e : 28
  , f : 29
  , g : 31
 };

var pitchMidi = function (pitch) {
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
      temp.pitch = pitchMidi(temp.pitch);
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

var compile = function (musexpr) {
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

module.exports = compile; 