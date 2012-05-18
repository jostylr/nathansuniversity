var Turtle;

module.exports = Turtle = function (o) {
    o = o || {};
    var w = o.w || 200;
    var h = o.w || 200;
    this.paper = Raphael(o.div || "#tortoise", w, h);
    this.originx = w / 2;
    this.originy = h / 2;
    this.oldx = 0;
    this.oldy = 0;
    this.clear();
    this.thick = o.thick || 4;
    this.speed = o.speed || 1; //fastest
    this.backg = o.backg || "white"; // white background
    this.color = o.color || "black;"
    this.pen = true;
    this.x = this.y = 0;
    this.angle = 90;
    this.steps = [];
};

var tp = Turtle.prototype;

tp.com = function (c) {
  if (c && c.hasOwnProperty('tag')) {
    console.log(c);
    this[c.tag](c);
  } else {
    throw "command without tag " + c;
  }
  this.steps.push(c);
};

tp.ret = function () {
  return this.steps;
};


tp.position = function (c) {

    if(this.pen) {
      this.drawTo(c.x, c.y, false);
    } else if (this.eraser) {
        this.drawTo(c.x, c.y, true);
      }

    this.moveTurtle(c.x, c.y);
};


tp.angle = function (c) {

    this.rotateTurtle(c.value);
};


tp.penup = function () {
  this.pen = false;
  this.eraser = false;
};

tp.pendown = function () {
  this.pen = true;
  this.eraser = false;
};

tp.eraser = function () {
  this.eraser = true;
  this.pen = false;
};

tp.clear = function () {
  this.paper.clear();
  this.pen = true;
  this.turtleimg = this.paper.image(
      "http://nathansuniversity.com/gfx/turtle2.png",
      0, 0, 64, 64);
  
};

tp.setColor = function (c) {
  this.color = c.value;
};

tp.setThick = function (c) {
  this.thick = c.value;
}

tp.speed = function (c) {
  this.speed = c.value;
};

tp.moveTurtle = function (x, y) {
  this.turtleimg.attr({
    x: x - 32 + this.originx,
    y: - y - 32 + this.originy
  });
  
  this.oldx = x;
  this.oldy = y;
  
  this.turtleimg.toFront();
};

tp.rotateTurtle = function (a) {
  
  this.turtleimg.attr({
    transform: "r" + (-a)
  });
  
  this.turtleimg.toFront();  
}

Turtle.prototype.drawTo = function (x, y, erase) {
    var x1 = this.oldx + this.originx;
    var y1 = this.originy - this.oldy;
    console.log(x1, y1, x + this.originx, this.originy - y)
    var params = { "stroke-width": this.thick, "color" : (erase ? this.backg : this.color) };
    var path = this.paper.path(Raphael.format("M{0},{1}L{2},{3}",
        x1, y1, x + this.originx,  this.originy - y)).attr(params);
};

turtle =  turtle || {
  com : function (c) {
    this.steps.push(c);
  },
  steps : [],
  ret : function () {
    return this.steps;
  }
};

var cos = function (a) {
  return Math.cos(Math.PI*a/180);
};

var sin = function (a) {
  return Math.sin(Math.PI*a/180);
};

var x, y, a, ox, oy, oa;
x = 0; 
y = 0;
a = 90;

return {
  turtle : turtle,
  vars : {
    cos : {
      lex : turtle, 
      body : cos
    },
    sin : {
      lex : turtle, 
      body : sin
    },
    print : {
      lex : turtle, 
      body : function (a) {
        $("#log").append("<li>"+a+"</li>");
      }
    },
    forward : {
      lex : turtle,
      body : function (d) {
        ox = x; 
        oy = y;
        x = Math.floor(ox + cos(a)*d + 0.5);
        y = Math.floor(oy + sin(a)*d + 0.5);
        this.com({tag : "position", x : x, y : y, ox : ox, oy: oy});
      } 
    }, 
    left : {
     lex : turtle,
     body : function (ang) {
       oa = a; 
       a += ang;
       this.com({tag : "angle", a: a, oa : oa});
     }
    },
    right : {
     lex : turtle,
     body : function (ang) {
       oa = a; 
       a -= ang;
       this.com({tag : "angle", a: a, oa : oa});
     }
    },     
    back : {
      lex : turtle,
      body : function (d) {
        ox = x; 
        oy = y;
        x = Math.floor(ox - cos(a)*d + 0.5);
        y = Math.floor(oy - sin(a)*d + 0.5);
        this.com({tag : "position", x : x, y : y, ox : ox, oy: oy});
      }
    },
    penup : {
     lex : turtle,
     body : function () {
        this.com({tag: "penup"});         
     }
    },
    pendown : {
     lex : turtle,
     body : function () {
       this.com({tag: "pendown"});         
     }
    },
    eraser : {
     lex : turtle,
     body : function () {
       this.com({tag: "eraser"});
     }
    },
    home : {
     lex : turtle,
      body : function () {
        this.com({tag : "position", x: 0, y : 0, ox : x, oy : y});
        ox = x; oy = y;
        x = 0; y = 0;
        this.com({tag : "angle", a: 90, oa: a});
        oa = a; a = 90;
      }
    },
    clear : {
     lex : turtle,
      body : function () {
        this.com({tag: "clear"});
        this.com({tag : "position", x: 0, y : 0, ox : x, oy : y});
        ox = x; oy = y;
        x = 0; y = 0;
        this.com({tag : "angle", a: 90, oa: a});
        oa = a; a = 90;
      }
    },
    color : {
     lex : turtle,
      body : function (i) {
        this.com({tag: "setColor", color: i});
      }
    },
    speed : {
     lex : turtle,
      body : function (speed) { // in pixel/ms?
        this.com({tag : "speed", speed : speed});          
      }
    },
    thick :  {
     lex : turtle,
     body : function (thick) {
       this.com({tag: "setThick", thickness : thick});
     }
    }
  }, //vars
