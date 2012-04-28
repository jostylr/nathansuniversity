var fs = require('fs');
var Midi = require('jsmidgen');

var file = new Midi.File();
var track = new Midi.Track();
file.addTrack(track);

track
  .noteOn(0, "c4", 500)
  .noteOn(1, "d5", 500)
  .noteOff(0, "c4", 500)
  .noteOff(1, "d5", 500)

fs.writeFileSync('test.mid', file.toBytes(), 'binary');