var longMus = (function (n) {
    var i = 0
     , tree = {tag : 'seq', left: {}, right : {}}
     , stack = [tree.left, tree.right]
     , cur
    ;

     cur = stack.pop();
     while (i < n && cur) {
       cur.tag = 'seq';
       cur.left = {};
       cur.right = {};
       stack.unshift(cur.right);
       stack.unshift(cur.left);
       cur = stack.pop();
       i += 1;
     }
     
     while (cur) {
       cur.tag = "note";
       cur.pitch = "c4";
       cur.dur = 250;
       cur = stack.pop();
     }
    
    return tree;
    
} (100));

compile = require('./compile2.js')

/*
console.log(longMus)

console.log(compile(longMus))
*/