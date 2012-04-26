

var midiPitch = function(textPitch) {
	var table;
	table = { a: 9, b: 11, c: 0, d: 2, e: 4, f: 5, g: 7 };
	return 12 + table[textPitch[0]] + 12 * textPitch[1];
}


var midiTable = (function () {
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
 
 
 
 
 
 var note_to_midi_mapper = function(note) {
   switch (note) {
     case 'a0':
       return 21;
     case 'a#0':
       return 22;
     case 'b0':
       return 23;
     case 'c1':
       return 24;
     case 'c#1':
       return 25;
     case 'd1':
       return 26;
     case 'd#1':
       return 27;
     case 'e1':
       return 28;
     case 'f1':
       return 29;
     case 'f#1':
       return 30;
     case 'g1':
       return 31;
     case 'g#1':
       return 32;
     case 'a1':
       return 33;
     case 'a#1':
       return 34;
     case 'b1':
       return 35;
     case 'c2':
       return 36;
     case 'c#2':
       return 37;
     case 'd2':
       return 38;
     case 'd#2':
       return 39;
     case 'e2':
       return 40;
     case 'f2':
       return 41;
     case 'f#2':
       return 42;
     case 'g2':
       return 43;
     case 'g#2':
       return 44;
     case 'a2':
       return 45;
     case 'a#2':
       return 46;
     case 'b2':
       return 47;
     case 'c3':
       return 48;
     case 'c#3':
       return 49;
     case 'd3':
       return 50;
     case 'd#3':
       return 51;
     case 'e3':
       return 52;
     case 'f3':
       return 53;
     case 'f#3':
       return 54;
     case 'g3':
       return 55;
     case 'g#3':
       return 56;
     case 'a3':
       return 57;
     case 'a#3':
       return 58;
     case 'b3':
       return 59;
     case 'c4':
       return 60;
     case 'c#4':
       return 61;
     case 'd4':
       return 62;
     case 'd#4':
       return 63;
     case 'e4':
       return 64;
     case 'f4':
       return 65;
     case 'f#4':
       return 66;
     case 'g4':
       return 67;
     case 'g#4':
       return 68;
     case 'a4':
       return 69;
     case 'a#4':
       return 70;
     case 'b4':
       return 71;
     case 'c5':
       return 72;
     case 'c#5':
       return 73;
     case 'd5':
       return 74;
     case 'd#5':
       return 75;
     case 'e5':
       return 76;
     case 'f5':
       return 77;
     case 'f#5':
       return 78;
     case 'g5':
       return 79;
     case 'g#5':
       return 80;
     case 'a5':
       return 81;
     case 'a#5':
       return 82;
     case 'b5':
       return 83;
     case 'c6':
       return 84;
     case 'c#6':
       return 85;
     case 'd6':
       return 86;
     case 'd#6':
       return 87;
     case 'e6':
       return 88;
     case 'f6':
       return 89;
     case 'f#6':
       return 90;
     case 'g6':
       return 91;
     case 'g#6':
       return 92;
     case 'a6':
       return 93;
     case 'a#6':
       return 94;
     case 'b6':
       return 95;
     case 'c7':
       return 96;
     case 'c#7':
       return 97;
     case 'd7':
       return 98;
     case 'd#7':
       return 99;
     case 'e7':
       return 100;
     case 'f7':
       return 101;
     case 'f#7':
       return 102;
     case 'g7':
       return 103;
     case 'g#7':
       return 104;
     case 'a7':
       return 105;
     case 'a#7':
       return 106;
     case 'b7':
       return 107;
     case 'c8':
       return 108;
   }
 };
 
 
 bm = require('benchmark')
 
 
 bming = function (checknote) {
   suite = new bm.Suite()
   
 suite
  .add("midi function", function () {
    midiPitch(checknote);
  })
  .add("midi table", function () {
    midiTable[checknote];
  })
  .add("midi case", function () {
    note_to_midi_mapper(checknote)
  } )
  .add("midi case inline", function () {
    switch (checknote) {
       case 'a0':
         return 21;
       case 'a#0':
         return 22;
       case 'b0':
         return 23;
       case 'c1':
         return 24;
       case 'c#1':
         return 25;
       case 'd1':
         return 26;
       case 'd#1':
         return 27;
       case 'e1':
         return 28;
       case 'f1':
         return 29;
       case 'f#1':
         return 30;
       case 'g1':
         return 31;
       case 'g#1':
         return 32;
       case 'a1':
         return 33;
       case 'a#1':
         return 34;
       case 'b1':
         return 35;
       case 'c2':
         return 36;
       case 'c#2':
         return 37;
       case 'd2':
         return 38;
       case 'd#2':
         return 39;
       case 'e2':
         return 40;
       case 'f2':
         return 41;
       case 'f#2':
         return 42;
       case 'g2':
         return 43;
       case 'g#2':
         return 44;
       case 'a2':
         return 45;
       case 'a#2':
         return 46;
       case 'b2':
         return 47;
       case 'c3':
         return 48;
       case 'c#3':
         return 49;
       case 'd3':
         return 50;
       case 'd#3':
         return 51;
       case 'e3':
         return 52;
       case 'f3':
         return 53;
       case 'f#3':
         return 54;
       case 'g3':
         return 55;
       case 'g#3':
         return 56;
       case 'a3':
         return 57;
       case 'a#3':
         return 58;
       case 'b3':
         return 59;
       case 'c4':
         return 60;
       case 'c#4':
         return 61;
       case 'd4':
         return 62;
       case 'd#4':
         return 63;
       case 'e4':
         return 64;
       case 'f4':
         return 65;
       case 'f#4':
         return 66;
       case 'g4':
         return 67;
       case 'g#4':
         return 68;
       case 'a4':
         return 69;
       case 'a#4':
         return 70;
       case 'b4':
         return 71;
       case 'c5':
         return 72;
       case 'c#5':
         return 73;
       case 'd5':
         return 74;
       case 'd#5':
         return 75;
       case 'e5':
         return 76;
       case 'f5':
         return 77;
       case 'f#5':
         return 78;
       case 'g5':
         return 79;
       case 'g#5':
         return 80;
       case 'a5':
         return 81;
       case 'a#5':
         return 82;
       case 'b5':
         return 83;
       case 'c6':
         return 84;
       case 'c#6':
         return 85;
       case 'd6':
         return 86;
       case 'd#6':
         return 87;
       case 'e6':
         return 88;
       case 'f6':
         return 89;
       case 'f#6':
         return 90;
       case 'g6':
         return 91;
       case 'g#6':
         return 92;
       case 'a6':
         return 93;
       case 'a#6':
         return 94;
       case 'b6':
         return 95;
       case 'c7':
         return 96;
       case 'c#7':
         return 97;
       case 'd7':
         return 98;
       case 'd#7':
         return 99;
       case 'e7':
         return 100;
       case 'f7':
         return 101;
       case 'f#7':
         return 102;
       case 'g7':
         return 103;
       case 'g#7':
         return 104;
       case 'a7':
         return 105;
       case 'a#7':
         return 106;
       case 'b7':
         return 107;
       case 'c8':
         return 108;
     }
  })
  .on('cycle', function(event, bench) {
    console.log(String(bench));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'));
  })
  .run()
  };
  
  bming("a0")
  bming("c4")
  bming("g7")
  
  