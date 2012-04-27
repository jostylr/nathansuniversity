/*globals module, require, console, exports*/

var fs = require('fs');

var pegjs = require('pegjs');


var parserTests = {
  clef: function (test) {
    var par = this.par;
    test.expect(1 );
    //test.equal(par("&a", "clef"), undefined, "&a");
    test.deepEqual(par("&4", "clef"), {tag:"clef", level:"4"}, "&4");
    test.done();
  }
  , key : function (test) {
    var par = this.par;
    test.deepEqual(par("{_ab}", "key"), { tag: 'key',
      flats: 
       [ { tag: 'seq',
           tree: 
            [ { tag: 'note', pitch: 'a', dur: 1 },
              { tag: 'note', pitch: 'b', dur: 1 } ] } ],
      sharps: [] }, "{_ab}")
    test.done();
  }
  , time: function (test) {
    var par = this.par;
    test.expect(2);
    test.deepEqual(par("(4, 4,120)", "time"), {tag:"time", bpm: 120, beatnote:4, one: 4}, "(4,4,120)");
    test.deepEqual(par("( 3,  4, 160 )", "time"), {tag:"time", bpm: 160, beatnote:4, one:3}, "(3,  4, 160)");
    test.done();    
  }
  , instrument : function (test) {
    var par = this.par;
    test.deepEqual(par("%Trumpet", "instrument"), {tag:"instrument", name:"Trumpet"});
    test.done();
  }
  , notes : function (test) {
    var par = this.par
    test.deepEqual(par("B", "note"), {tag:"note", pitch:"B", dur: 1}, "a");    
    test.deepEqual(par("a4", "note"), {tag:"note", pitch:"a", dur: 1/4}, "a4");
    test.deepEqual(par("a4.", "notes"), {tag:"note", pitch:"a", dur: 1/4, dotted:1}, "a4.");
    test.deepEqual(par("a~c2 ~4c ~  e", "notes"), 
    { tag: 'slur',
      tree: 
       [ { tag: 'note', pitch: 'a', dur: 1 },
         { tag: 'note', pitch: 'c', dur: 0.5 },
         { tag: 'note', pitch: 'c', dur: 4 },
         { tag: 'note', pitch: 'e', dur: 1 } ] }, "a~c2 ~4c ~  e");
    test.deepEqual(par("a4 3c", "notes"), {tag:"seq", tree: 
      [ { tag: 'note', pitch: 'a', dur: 0.25 },
        { tag: 'note', pitch: 'c', dur: 3 } ] }, "a4 3c");
    test.deepEqual(par("a4 3c 2d4FE 3- -4", "notes"),     { tag: 'seq',
          tree: 
           [ { tag: 'note', pitch: 'a', dur: 0.25 },
             { tag: 'note', pitch: 'c', dur: 3 },
             { tag: 'note', pitch: 'd', dur: 2 },
             { tag: 'note', pitch: 'F', dur: 4 },
             { tag: 'note', pitch: 'E', dur: 1 },
             { tag: 'rest', dur: 3 },
             { tag: 'rest', dur: 0.25 } ] })
    test.done();
  }
  , smallpar : function (test) {
    var par = this.par;
    test.expect(2);
    test.deepEqual(par("[ab- 3c]", "smallpar"), { tag: 'par',
      tree: 
       [ { tag: 'note', pitch: 'a', dur: 1 },
         { tag: 'note', pitch: 'b', dur: 1 },
         { tag: 'rest', dur: 1 },
         { tag: 'note', pitch: 'c', dur: 3 } ] }, "[ab- 3c]");
    test.deepEqual(par("[a|b-|3c]", "smallpar"), 
       { tag: 'par',
         tree: 
          [ { tag: 'note', pitch: 'a', dur: 1 },
            { tag: 'seq',
              tree: [ { tag: 'note', pitch: 'b', dur: 1 }, { tag: 'rest', dur: 1 } ] },
            { tag: 'note', pitch: 'c', dur: 3 } ] }, "[a|b-|3c]");
    test.done();
  }
  , smallrepeat : function (test) {
    var par = this.par;
    test.expect(2);
    test.deepEqual(par(":A-a;;", "smallrepeat"), { tag: 'repeat',
      content: 
       { tag: 'seq',
         tree: 
          [ { tag: 'note', pitch: 'A', dur: 1 },
            { tag: 'rest', dur: 1 },
            { tag: 'note', pitch: 'a', dur: 1 } ] },
      count: 3 }
    , ":A-a;;");
    test.deepEqual(par(":[ABC] :ab; ;;", "smallrepeat"), { tag: 'repeat',
      content: 
       { tag: 'seq',
         tree: 
          [ { tag: 'par',
              tree: 
               [ { tag: 'note', pitch: 'A', dur: 1 },
                 { tag: 'note', pitch: 'B', dur: 1 },
                 { tag: 'note', pitch: 'C', dur: 1 } ] },
            { tag: 'repeat',
              content: 
               { tag: 'seq',
                 tree: 
                  [ { tag: 'note', pitch: 'a', dur: 1 },
                    { tag: 'note', pitch: 'b', dur: 1 } ] },
              count: 2 } ] },
      count: 3 }, ":[ABC] :ab; ;;");
    test.done();
  }
  , whole : function (test){
    var par = this.par;
    test.expect(5);
    test.deepEqual(par("ab"), { tag: 'seq',
      tree: 
       [ { tag: 'par',
           tree: 
            [ { tag: 'seq',
                tree: 
                 [ { tag: 'note', pitch: 'a', dur: 1 },
                   { tag: 'note', pitch: 'b', dur: 1 } ] } ] } ] }, "ab");
                   
                   
                   
    test.deepEqual(par("=:\nab\n=;;"),
    { tag: 'seq',
      tree: 
       [ { tag: 'par', tree: [] },
         { tag: 'repeat',
           tree: 
            [ { tag: 'par',
                tree: 
                 [ { tag: 'seq',
                     tree: 
                      [ { tag: 'note', pitch: 'a', dur: 1 },
                        { tag: 'note', pitch: 'b', dur: 1 } ] } ] } ],
           count: 3 },
         { tag: 'par', tree: [] } ] }, "=:\nab\n=;;");
   test.deepEqual(par("ab\n\ncd"),    
   { tag: 'seq',
     tree: 
      [ { tag: 'par',
          tree: 
           [ { tag: 'seq',
               tree: 
                [ { tag: 'note', pitch: 'a', dur: 1 },
                  { tag: 'note', pitch: 'b', dur: 1 } ] },
             { tag: 'seq',
               tree: 
                [ { tag: 'note', pitch: 'c', dur: 1 },
                  { tag: 'note', pitch: 'd', dur: 1 } ] } ] } ] }, "ab\n\ncd");
  test.deepEqual(par("(4,4,120)&4>ab\ncd\n=\nA[BC]"),                
  { tag: 'seq',
    tree: 
     [ { tag: 'par',
         tree: 
          [ { tag: 'seq',
              tree: 
               [ { tag: 'clef', level: 4 },
                 { tag: 'time', one: 4, beatnote: 4, bpm: 120 },
                 { tag: 'channel', num: 0 },
                 { tag: 'note', pitch: 'a', dur: 1 },
                 { tag: 'note', pitch: 'b', dur: 1 } ] },
            { tag: 'seq',
              tree: 
               [ { tag: 'note', pitch: 'c', dur: 1 },
                 { tag: 'note', pitch: 'd', dur: 1 } ] } ] },
       { tag: 'par',
         tree: 
          [ { tag: 'seq',
              tree: 
               [ { tag: 'clef', level: 4 },
                 { tag: 'time', one: 4, beatnote: 4, bpm: 120 },
                 { tag: 'channel', num: 0 },
                 { tag: 'note', pitch: 'A', dur: 1 },
                 { tag: 'par',
                   tree: 
                    [ { tag: 'note', pitch: 'B', dur: 1 },
                      { tag: 'note', pitch: 'C', dur: 1 } ] } ] } ] } ] }, "(4,4,120)&4\nab\ncd\n\nA[BC]")
    test.deepEqual(par("=:\n(4,4,120)>ab\n=\ncd\n=:\nab\n=;\ncd\n=;;"),              
    { tag: 'seq',
      tree: 
       [ { tag: 'par', tree: [] },
         { tag: 'repeat',
           tree: 
            [ { tag: 'par',
                tree: 
                 [ { tag: 'seq',
                     tree: 
                      [ { tag: 'time', one: 4, beatnote: 4, bpm: 120 },
                        { tag: 'channel', num: 0 },
                        { tag: 'note', pitch: 'a', dur: 1 },
                        { tag: 'note', pitch: 'b', dur: 1 } ] } ] },
              { tag: 'par',
                tree: 
                 [ { tag: 'seq',
                     tree: 
                      [ { tag: 'time', one: 4, beatnote: 4, bpm: 120 },
                        { tag: 'channel', num: 0 },
                        { tag: 'note', pitch: 'c', dur: 1 },
                        { tag: 'note', pitch: 'd', dur: 1 } ] } ] },
              { tag: 'repeat',
                tree: 
                 [ { tag: 'par',
                     tree: 
                      [ { tag: 'seq',
                          tree: 
                           [ { tag: 'time', one: 4, beatnote: 4, bpm: 120 },
                             { tag: 'channel', num: 0 },
                             { tag: 'note', pitch: 'a', dur: 1 },
                             { tag: 'note', pitch: 'b', dur: 1 } ] } ] } ],
                count: 2 },
              { tag: 'par',
                tree: 
                 [ { tag: 'seq',
                     tree: 
                      [ { tag: 'time', one: 4, beatnote: 4, bpm: 120 },
                        { tag: 'channel', num: 0 },
                        { tag: 'note', pitch: 'c', dur: 1 },
                        { tag: 'note', pitch: 'd', dur: 1 } ] } ] } ],
           count: 3 },
         { tag: 'par', tree: [] } ] }, "=:\n(4,4,120)>ab\n=\ncd\n=:\nab\n=;\ncd\n=;;");
    test.done()
  }
};

/*
: function (test) {
  var par = this.par
  test.expect(2);
  
  test.done();
}
*/


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



makePar = function (fname, tname) {
  var par = clone(parserTests);

  par.setUp = function (cb) {
    var text = fs.readFileSync(fname, "utf8");
    try {
      var scheem = pegjs.buildParser(text); 
    } catch (e) {
      console.log("parser failed", e);
      throw e
    }
    this.par = function (str, start) {
      try {
        return scheem.parse(str, start);
      } catch (e) {
        console.log(e);
        return undefined;
      }
    };  
    cb();
  };

  exports[tname] = par;  
};

makePar("mus.peg", "mus");