/*globals console */

var num = 4;

var rFactorial = function (n) {
    if (n <= 1) {
        return 1;
    } else {
        console.log("r desc", n-1);
        var d = rFactorial(n-1)*n;
        console.log("r asc", d);
        return d;
    }
};

console.log("r end", rFactorial(num));

var cFactorial = function (n, cont) {
    if (n <= 1) {
        console.log(1);
        return cont(1);
    } else {
        var newCont = function (v) {
            console.log("cont up", v, "n =", n);
            return cont(v*n);
        };
        console.log("c desc", n-1);
        var d = cFactorial(n-1, newCont);
        console.log("c asc", d);
        return d;
    }
};

var ans = cFactorial(num, function (x) {console.log("initial cont", x); return x;});

console.log("c with return end", ans);

var cnorFactorial = function (n, cont) {
    if (n <= 1) {
        console.log(1);
        cont(1);
    } else {
        var newCont = function (v) {
            console.log("cont up", v, "n =", n);
            cont(v*n);
        };
        console.log("c desc", n-1);
        cnorFactorial(n-1, newCont);
    }
};

var store; 

cnorFactorial(num, function (x) {console.log("base", x); store = x;});

console.log("end no return", store);

var thunk = function (f, lst, name) {
    return { tag: "thunk", func: f, args: lst, name: name };
};

var thunkValue = function (x) {
    console.log("basic cont", x);
    return { tag: "value", val: x };
};

var trampoline = function (thk) {
    while (true) {
        console.log("tramp", thk);
        if (thk.tag === "value") {
            return thk.val;
        }
        if (thk.tag === "thunk") {
                    var cont = thk.func;
        var count = 0;
        while (true) {
            if (cont.hasOwnProperty("cont")) {
            count += 1;
            cont = cont.cont;   
            } else {
                break;
            }
        } 
        console.log("ancestors", count);

            thk = thk.func.apply(null, thk.args);
        }
    }
};

var tfactorial = function (n, cont) {
    var t;
    if (n <= 1) {
        console.log("base", 1);
        t = thunk(cont, [1], "base");
        console.log("base t", t);
        return t;
    } else {
        var new_cont = function (v) {
            console.log("cont up", v, "from n = " + n);
            t = thunk(cont, [v*n], "level", n);
            console.log("func", t.args);
            return t;
        };
        new_cont.cont = cont;
        t = thunk(tfactorial, [n-1, new_cont], "repeat n-1 = " + (n-1));
        return t;
    }
};

console.log("end thunked fact", trampoline(tfactorial(num, thunkValue)));


var stacker = function (func, args) {
    var env   = {};
    var stack = [];
    var t     = {env: env, stack: stack};

    var cur   = {func : func, args: args, name : "initi"};

    while (cur) {
        console.log("stacker", cur, "\n stack:", stack, "\n env", env);

        cur.func.apply(t, cur.args);

        cur = stack.pop();
    }
    return env.ret;
};

var mult = function (a) {
    this.env.ret *= a;
};

var sfactorial = function (n) {
    //console.log(this);
    if (n <= 1) {
        console.log("base", 1);
        this.env.ret = 1;
    } else {
        this.stack.push({func: mult, args: [n], name : "mult"});
        this.stack.push({func: sfactorial, args : [n-1], name : "fact"});
    }
};

console.log("end stack fact", stacker(sfactorial, [num]));