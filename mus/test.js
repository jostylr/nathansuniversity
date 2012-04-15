compile2 = require('./compile2.js')
compile1 = require('./compile.js')

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
         right: { tag: 'note', pitch: 'd4', dur: 500 } } };


console.log(compile1(simple))
console.log(compile1(repeat))
console.log(compile2(simple))
console.log(compile2(repeat))

console.log(compile1(melody_mus));
console.log(compile2(melody_mus));
