MathPeg

Author: James Taylor  jostylr@gmail.com

SHORT DESCRIPTION: 
MathPeg is designed to facilitate mathematical explorations using the language of mathematics. To that end, all operators are dynamically defined and overloadable. The fixed syntax is mainly used to define block and line structure. Generally, the defined operators would be in a library and the resulting defined syntax would be quite normal looking. Flow control is also dynamically implemented on top of some primitives. Numbers have arbitrary precision to facilitate exploration of errors and to avoid rounding distractions in basic maths.

EXAMPLE: 
--------
DEF (prod, _, init EXPR, ^, n NUM, body EXPR) {p num} :
  name = GETVAR(init)
  p = 1
  LOOP(init, name = name + 1, name, name < n, p = p * body)
.

SYM (!, 10) 

DEF (!, n num) num :
  prod_i=1^n i
.

DEF (sumf, a num, b num) num :
  (a+b)!
.

m = sumf(100, 200)

n = (+ 10 20 50 90)!

long = 123456789123456890 * 1234.134141234898452345909823045 + 1.4E-27


-----------

RULES: 
  {[(\{\[\(  \)\]\})]}  create blocks. In addition, a colon followed by a newline starts a block and a period on a line by itself (other than comments) ends it. Left and right brackets can be mixed and matched as needed for notational needs

  Lines are defined by newlines or semicolons. 

  Numbers can be arbitrarily long. 

  Symbols can be arbitrarily long, identifiers can be arbitrarily long, to mix them use a single quote: '+o  They all are just identifiers to be looked up.

  Absolute value is implemented with vertical bars. To use something like the or ||, use '|| 

  Strings are double quotes. No escaping. Newlines are taken literally.

  Not implemented:
  Comment: //comment
  Line continuation /\n
  Comment and line continuation ///comment

Predefined functions: 
  DEF takes in (variable name/type or symbol, ...) {return object whose variable name/type (s) is the return} :
    body that doe stuff
  .

  ADD, MULT, DIV, SUB, POW,.... math function aliases

  LOOP implements loops

  BRANCH implements branching statements

License: MIT

Copyright (c) 2012 James Taylor (jostylr@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.