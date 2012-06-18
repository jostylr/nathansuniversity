 /*globals require, module, console*/
/*jshint asi:true, laxcomma: true */

//make lists and get, reverse, sort them

var thunk = function (f, args) {
  return {tag: "thunk", func : f, args: args};
};

var thunkValue = function (x) {
    return { tag: "value", val: x };
};


// uses trampoline to construct lists
var List = function (items, tag, existing, cont) {
    var old;
    var item = items[0];
    tag = tag || "next";

    //base case
    if (items.length === 1) {
      if (item instanceof List) {
        cont(item);
      } else {
        this.item = item;
        cont(this);
      }
    } else {
      if (item instanceof List) {
        // this is discarded
        old = item;
      } else {
        // make item into list
        this.item = item;
        old = this;
      }

      var newCont = function (next) {
        if (item.hasOwnProperty(tag)){

          if (existing === "follow") {   
            
            // add next at end
            old.end()[tag] = next;
          } else { 

            // replace pointer from old list
            old[tag] = next;
          }
        } else {

          //fresh tag
          item[tag] = next;
        }
        return thunk(cont, old);
      };

      return thunk(List, [items.slice(1), tag, existing, newCont]);
    }
};


List.newTrampoline = function (thk) {
  while (true) {
    if (thk.tag === "value") {
      return thk.val;
    } 
    if (thk.tag === "thunk") {
      thk = new thk.func(thk.args[0], thnk.args[1], thnk.args[2]);
    }
  }
};

List.trampoline = function (thk) {
  while (true) {
    if (thk.tag === "value") {
      return thk.val;
    } 
    if (thk.tag === "thunk") {
      thk = thk.func.apply(null, thk.args);
    }
  }
};



module.exports = List

var lp = List.prototype

lp.linkTag = function () {

};

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