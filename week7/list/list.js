/*globals console, log, require, module */

var List = function (a) {
	if (a instanceof List) {
		return a;
	} else {
		this.item = a;
		return this;
	}
};


var stacker = function (func, args) {
    var env   = {};
    var stack = [];
    var t     = {env: env, stack: stack};

    var cur   = {func : func, args: args, name : "initi"};

    while (cur) {
       //console.log("stacker", cur, "\n stack:", stack, "\n env", env);

        cur.func.apply(t, cur.args);

        cur = stack.pop();
    }
    return env.ret;
};

var link = function (item, tag, existing) {
	tag = tag || "next";
	existing = existing || "follow";

	if (item.hasOwnProperty(tag)) {
		if (existing === "follow") {
			item.end(tag)[tag] = this.env.ret;
		} else {
			// overwrite
			item[tag] = this.env.ret;

		}
	} else {
		item[tag] = this.env.ret;
	}
	this.env.ret = item;
};

var sthread = function (items, tag, existing) {

	if (!items || items.length < 1) {
		throw "No item " + items; 
	}

	if (items.length === 1) {
		this.env.ret = new List(items[0]);
	} else {
		this.stack.push({func : link, args: [new List(items[0]), tag, existing ]});
		this.stack.push({func: sthread, args : [items.slice(1), tag, existing]});
	}
};


List.thread = function (items, tag, existing) {
	return stacker(sthread, [items, tag, existing]);
};

var a = List.thread([1, 3, 4]); 

var b = List.thread([a.next.next, a.next, a], "prev");

console.log(b);

var lp = List.prototype;

// get array of values of the list items

var unshift = function (val) {
	this.env.ret.unshift(val); 
};

var sArrayVal = function (item, tag) {

	if (! item.hasOwnProperty(tag) ) {
		this.env.ret = [item.item];
	} else {
		this.stack.push({func : unshift, args : [item.item]});
		this.stack.push({func : sArrayVal, args: [item[tag], tag]});
	}
};


lp.toArrayVal = function (tag) {
	tag = tag || "next";

	return stacker(sArrayVal, [this, tag]);

};

//console.log(a.toArrayVal(), a.next.toArrayVal(), a.toArrayVal("prev"), b.toArrayVal(), b.toArrayVal("prev"));

// get array as list items

var sArray = function (item, tag) {

	if (! item.hasOwnProperty(tag) ) {
		this.env.ret = [item];
	} else {
		this.stack.push({func : unshift, args : [item]});
		this.stack.push({func : sArray, args: [item[tag], tag]});
	}
};


lp.toArray = function (tag) {
	tag = tag || "next";

	return stacker(sArray, [this, tag]);

};

//console.log(a.toArray(), a.next.toArray(), a.toArray("prev"), b.toArray(), b.toArray("prev"));


// get end item

var sEnd = function (item, tag) {
	if (! item.hasOwnProperty(tag) ) {
		this.env.ret = item;
	} else {
		this.stack.push({func : sArray, args: [item[tag], tag]});
	}

};

lp.end = function (tag) {
	tag = tag || "next";
	return stacker(sEnd, [this, tag]);
};

console.log("a:", a.end(), "\nb:", b.end());


// get nth item so n=1 is first item

var sN = function (n, item, tag) {
	if (n <= 1) {
		this.env.ret = item;
	} else if (!item || !item.hasOwnProperty(tag)) {
		this.env.ret = null;
	} else {
		this.stack.push({func: sN, args : [n-1, item[tag], tag]});
	}
};

lp.n = function (n, tag) {
	tag = tag || "next";
	return stacker(sN, [n, this, tag]);	
};

console.log("1", a.n(1), "\n2", a.n(2), "\nbad", a.n(4));

// length

var sLength = function (count, item, tag) {
	count += 1;
	if (! item.hasOwnProperty(tag) ) {
		this.env.ret = count;
	} else {
		this.stack.push({func : sLength, args: [count, item[tag], tag]});
	}

};

lp.length = function (tag) {
	tag = tag || "next";
	return stacker(sLength, [0, this, tag]);
};

console.log("a:", a.length(), "\nb:", b.length("prev"));

// reverse list

var sReverse = function (item, tagdown, tagreverse) {
	if (! item.hasOwnProperty(tagdown) ) {
		this.env.ret = item;
	} else {
		var next = item[tagdown];
		next[tagreverse] = item;
		this.stack.push({func : sReverse, args: [next, tagdown, tagreverse]});
	}

};

lp.reverse = function (tagdown, tagreverse) {
	tagdown = tagdown || "next";
	tagreverse = tagreverse || "prev";
	return stacker(sReverse, [this, tagdown, tagreverse]);
};

console.log(List.thread(["A", "B", "C"]).reverse());

// shuffle
var shuffle = function (arr) {
	var i, j, temp;
	var n = arr.length;

	for (i = 0 ; i<n; i += 1) {
		j = Math.floor(Math.random() * (n - i)) + i;
		temp = arr[j];
		arr[j] = arr[i];
		arr[i] = temp; 
	}
};



lp.shuffle = function (tag) {
	tag = tag || "shuffle";

	var arr = this.toArray();
	shuffle(arr);
	return List.thread(arr, tag, "overwrite");

};

var	cards = ["2c",  "2d",  "2h",  "2s",  "3c",  "3d",  "3h",  "3s",  "4c",  "4d",  "4h",  "4s",  "5c",  "5d",  "5h",  "5s",  
				"6c",  "6d",  "6h",  "6s",  "7c",  "7d",  "7h",  "7s",  "8c",  "8d",  "8h",  "8s",  "9c",  "9d",  "9h",  "9s", 
				"Tc",  "Td",  "Th",  "Ts",  "Jc",  "Jd",  "Jh",  "Js",  "Qc",  "Qd",  "Qh",  "Qs",  "Kc",  "Kd",  "Kh",  "Ks", 
				"Ac",  "Ad",  "Ah",  "As"
			];


var deck = List.thread(cards);

var fi = deck.shuffle("first");
var se = deck.shuffle("second");
var th = deck.shuffle("third");

//console.log(fi.toArrayVal("first"), se.toArrayVal("second"), th.toArrayVal("third"));

