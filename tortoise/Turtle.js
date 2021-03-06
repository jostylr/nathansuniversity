var Turtle;

module.exports = Turtle = function (o) {
    o = o || {};
    var w = o.w || 200;
    var h = o.w || 200;
    this.paper = Raphael(o.div || "#tortoise", w, h);
    this.moves = [];
    var t = this;
    this.next = function () {
      t.turtleimg.toFront();
      if (t.moves.length > 0) {
        t.turtleimg.animate.apply(t.turtleimg, t.moves.shift());
      } else {
        this.active = false;
      }
    };
    this.paths = [];
    this.nextPath = function () {
      if (t.paths.length > 0) {
        var attrib = t.paths.shift();
        var path = attrib.shift();
        path.animate.apply(path, attrib);
      } else {
        this.activePath = false; 
      }
    };
    
    this.originx = w / 2;
    this.originy = h / 2;
    this.oldx = this.x = 0;
    this.oldy = this.y = 0;
    this.a = 90;
    this.speed = 0;
    this.clear();
    this.updateTurtle();
    this.thick = o.thick || 4;
    this.speed = o.speed || 0; // pixels/second
    this.backg = o.backg || "white"; // white background
    this.color = o.color || "black";
    this.current = [0,0,90];
    this.pen = true;
    this.steps = [{tag : "p osition", x : 0, y : 0}, {tag : "angle", value : 90}];
};

var tp = Turtle.prototype;

tp.com = function (c) {
  if (c && c.hasOwnProperty('tag')) {
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
  
  this.oldx = this.x;
  this.oldy = this.y;
  this.x = c.x;
  this.y = c.y;
  
  this.drawSeg();
  this.updateTurtle();
};


tp.angle = function (c) {

  this.olda = this.a;
  this.a = c.value;
  this.drawSeg();
  this.updateTurtle();
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
  this.pendown();
  this.turtleimg = this.paper.image(
      "http://nathansuniversity.com/gfx/turtle2.png",
      0, 0, 64, 64);
  
};

tp.setColor = function (c) {
  this.color = c.value;
};

tp.setThick = function (c) {
  this.thick = c.value;
};

tp.setSpeed = function (c) {
  if (this.speed < 0) {
    this.speed = 0;
  } else {
    this.speed = c.value;
  }
};


tp.updateTurtle = function () {
  this.moves.push([{
    x: this.x - 32 + this.originx,
    y: - this.y - 32 + this.originy,
    transform: "r" + (-this.a)
  }, this.speed, "linear", this.next]);
  if (!this.active) {
    this.active = true;
    this.next();
  }
    
  
  //hack
  //this.current = [this.x, this.y, this.a];
};

Turtle.prototype.drawSeg = function () {
  var x1, y1, params, path;

  x1 = this.oldx + this.originx;
  y1 = this.originy - this.oldy;    
  params = { 
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    "stroke":  (this.eraser ? this.backg : this.color),
    "stroke-width": this.thick,
    "stroke-opacity" : 0
    
    };
  path = this.paper.path(Raphael.format("M{0},{1}L{2},{3}",
        x1, y1, this.x + this.originx,  this.originy - this.y)).attr(params);
  if (this.pen || this.eraser) {
    this.paths.push([path, {"stroke-opacity": 1}, this.speed, "<", this.nextPath]);
  } else {
    this.paths.push([path, {"stroke-opacity": 0}, this.speed, "linear", this.nextPath]);
  }
  if (!this.activePath) {
    this.activePath = true;
    this.nextPath();
  }
  
};
