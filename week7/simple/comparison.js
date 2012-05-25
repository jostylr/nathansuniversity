/*globals console */

var num = 4;

var rFactorial = function (n) {
    if (n <= 1) {
        return 1;
    } else {
        var d = rFactorial(n-1)+n;
        return d;
    }
};

console.log("r end", rFactorial(num));

var cFactorial = function (n, cont) {
    if (n <= 1) {
        return cont(1);
    } else {
        var newCont = function (v) {
            return cont(v+n);
        };
        var d = cFactorial(n-1, newCont);
        return d;
    }
};

var ans = cFactorial(num, function (x) {return x;});

console.log("c with return end", ans);

var cnorFactorial = function (n, cont) {
    if (n <= 1) {
        cont(1);
    } else {
        var newCont = function (v) {
            cont(v+n);
        };
        cnorFactorial(n-1, newCont);
    }
};

var store; 

cnorFactorial(num, function (x) {store = x;});

console.log("end no return", store);

var thunk = function (f, lst, name) {
    return { tag: "thunk", func: f, args: lst, name: name };
};

var thunkValue = function (x) {
    return { tag: "value", val: x };
};

var trampoline = function (thk) {
    while (true) {
        if (thk.tag === "value") {
            return thk.val;
        }
        if (thk.tag === "thunk") {
            thk = thk.func.apply(null, thk.args);
        }
    }
};

var tfactorial = function (n, cont) {
    var t;
    if (n <= 1) {
        t = thunk(cont, [1]);
        return t;
    } else {
        var new_cont = function (v) {
            t = thunk(cont, [v+n]);
            return t;
        };
        t = thunk(tfactorial, [n-1, new_cont]);
        return t;
    }
};



var stacker = function (func, args) {
    var env   = {};
    var stack = [];
    var t     = {env: env, stack: stack};

    var cur   = {func : func, args: args};

    while (cur) {

        cur.func.apply(t, cur.args);

        cur = stack.pop();
    }
    return env.ret;
};

var mult = function (a) {
    this.env.ret += a;
};

var sfactorial = function (n) {
    if (n <= 1) {
        //console.log("base", 1);
        this.env.ret = 1;
    } else {
        this.stack.push({func: mult, args: [n]});
        this.stack.push({func: sfactorial, args : [n-1]});
    }
};

setTimeout(function () {
    bignum = 3e6;
     console.log("end thunked fact", trampoline(tfactorial(bignum, thunkValue)));
    setTimeout(function () {
        console.log("end stack fact", stacker(sfactorial, [bignum]));
    }, 1000);

}, 1000);

