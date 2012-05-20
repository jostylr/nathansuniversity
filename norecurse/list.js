/*globals require, module, console*/
/*jshint asi:true, laxcomma: true */

//make lists and get, reverse, sort them

var List = function () {
  var previous, i
    , initial = {}
    , current = initial
    , n = arguments.length

console.log(arguments);

  for (i = 0; i < n; i += 1) {
    previous = current
    current = {item : arguments[i], previous : previous}
    previous.next = current
  }

  initial.previous = null;

  this.begin = initial;
  this.end = current;

  return this

}

module.exports = List

var lp = List.prototype

lp.get = function (n) {

}