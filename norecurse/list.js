/*globals require, module, console*/
/*jshint asi:true, laxcomma: true */

//make lists and get, reverse, sort them

// uses recursion to construct lists
var List = function (items, tag, existing) {

    var item = items[0];
    tag = tag || "next";

    //base case
    if (items.length === 1) {
      if (item instanceof List) {
        return item;
      } else {
        this.item = item;
        return this;
      }
    }

    // recursive 
    var next = new List(items.slice(1), tag, existing);

    if (item instanceof List) {
      if (item.hasOwnProperty(tag)){

        if (existing === "follow") {   // add next at end
          item.end()[tag] = next;
        } else { // replace pointer from old list
          item[tag] = next;
        }

      } else {

        item[tag] = next;
      }
      return item;
    } else {
      this.item = item; 
      this[tag] = next; 
      return this;
    }
};

module.exports = List

var lp = List.prototype

lp.itemsToArray = function (arr, tag) {
  tag = tag || "next";
  arr.push(this.item);
  if (this.hasOwnProperty(tag)) {
    return this[tag].itemsToArray(arr, tag);
  } else {
    return arr
  }

}

lp.get = function (n, tag) {
  tag = tag || "next";

  if (n <= 1) {
    return this.item;
  }

  if (this.hasOwnProperty(tag)) {
    return this[tag].get(n-1, tag);
  } else {
    return null;
  }
}

lp.slice = function (n, tag) {
  tag = tag || "next";

  if (n <= 1) {
    return this;
  }

  if (this.hasOwnProperty(tag)) {
    return this[tag].get(n-1, tag);
  } else {
    return null;
  }
}