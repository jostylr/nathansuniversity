var fs = require('fs');

var pegjs = require('pegjs');

var text = fs.readFileSync("bm.scm", "utf8");

var request = require('request');

var Benchmark = require('benchmark');

var suite = new Benchmark.Suite;

suite 
  .on('cycle', function(event, bench) {
    console.log(String(bench));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'));
  });

var load = require("./load")

load(function (par, name) {
  suite.add(name, function () {
    par(text);
  });
}, function () {
  suite.run();
});
  
