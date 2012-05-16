var Turtle;

module.exports = Turtle = function (x, y, w, h) {
    this.paper = Raphael(x, y, w, h);
    this.originx = w / 2;
    this.originy = h / 2;
    this.clear();
    this.current = [0, 0, 90];
    this.steps = [{tag : "position", value : [0, 0]}, {tag : "angle", value : 90}];
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


tp.forward = function (c) {
  
    if(this.pen) {
          this.drawTo(c.position.x, c.position.newy);
    }
      this.x = newx;
      this.y = newy;
      this.updateTurtle();
     c.postion  [x, y]});
 } // body
},  //forward
left = function (a) {
    this.current[2] +=  a;
    this.com({tag : "angle", value : this.current[2]});
    return this;
  }
},
right = function (a) {
    this.current[2] -=  a;
    this.com({tag : "angle", value : this.current[2]});
    return this;
  }
},     
back : {
   lex : turtle,
   body : function (d) {
     //[x, y, angle]
     var a = this.current[2] 
     , x = Math.floor(this.current[0] - cos(a)*d + 0.5)
     , y = Math.floor(this.current[1] - sin(a)*d + 0.5)
       ;
       
     this.current = [x, y, a];
     this.com({tag : "position", value : [x, y]});
     return this;
 } // body
},  //back
penup = function () {
     this.com({tag: "penup"});         
  }
},
pendown = function () {
    this.com({tag: "pendown"});         
  }       
},
eraser = function () {
    this.com({tag: "eraser"});
  }
},
home = function () {
     this.current = [0,0,90];
     this.com({tag : "position", value : [0, 0]});
     this.com({tag : "angle", value : 90});
   }
},
clear = function () {
     this.com({tag: "clear"});
     this.com({tag : "position", value : [0, 0]});
     this.com({tag : "angle", value : 90});
     this.current = [0,0,90];
   }
},
color = function (i) {
     this.com({tag: "color", value: str});
   }
},
speed = function (speed) { // in pixel/ms?
     this.com({tag : "speed", value : speed});          
   }

Turtle.prototype.clear = function () {
    this.paper.clear();
    this.x = this.originx;
    this.y = this.originy;
    this.angle = 90;
    this.pen = true;
    this.turtleimg = undefined;
    this.updateTurtle();
};

Turtle.prototype.updateTurtle = function () {
    if(this.turtleimg === undefined) {
        this.turtleimg = this.paper.image(
            "http://nathansuniversity.com/gfx/turtle2.png",
            0, 0, 64, 64);
    }
    this.turtleimg.attr({
        x: this.x - 32,
        y: this.y - 32,
        transform: "r" + (-this.angle)});
    this.turtleimg.toFront();
};

Turtle.prototype.drawTo = function (x, y) {
    var x1 = this.x;
    var y1 = this.y;
    var params = { "stroke-width": 4 };
    var path = this.paper.path(Raphael.format("M{0},{1}L{2},{3}",
        x1, y1, x, y)).attr(params);
};

Turtle.prototype.forward = function (d) {
    var newx = this.x + Math.cos(Raphael.rad(this.angle)) * d;
    var newy = this.y - Math.sin(Raphael.rad(this.angle)) * d;
    if(this.pen) {
        this.drawTo(newx, newy);
    }
    this.x = newx;
    this.y = newy;
    this.updateTurtle();
};