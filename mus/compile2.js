
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


var compile = function (expr) {
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
            console.log(cur.time, cur.leftTime)
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

module.exports = compile