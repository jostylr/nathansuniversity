#MathPeg

This is the specification for the language MathPeg.

Goal: Implement a full computing language using just the notions in mathematics. 

Naming: Forcing a math peg into a programming hole. Also, PegJS powers the parsing.


## Peg processing

The idea is that the language should be entirely sculptable. Therefore, we start with the peg doing just tokenizing and parsing the blocks. 

### Statements 

expression ended by newline or ;   Newlines automatically end lines unless \ ends a line which then continues. ws including  // comments  are allowed.

### Expressions

A set of tokens

### Blocks
These are bracketed: expressions, comma'd expression, and statements. 

{([ and slashed: \{\(\[


A special expression block is absolute value. It is of the form | number/word ... |  or | block ... |

### Tokens

* String is a "stuff"   The double quote can be multiline. 
* Special is 'wh$2  This is terminated by whitespace. The single quote does not have a match, it just waits for a whitespace.
* Words:  `[a-zA-Z][a-zA-Z0-9]*`  No underscore or other symbols. 
* Symbols:  non-word esque. It terminates at first word/number. 


|(3 + z) + |3|x| | | word, number, bracketed expression

----
#Old

## Valid Variable Names

Single letters or 'Abce or "Abc de" := 5. A string is checked for existence and if it is not, then it is used as is. Otherwise, it is. To quote an existing string, use '"Abc de" is just Abc de.  

:abcde could be var name


## Types

### Numbers
Numbers can be integers, real, fractional, complex, quaternion. They can be arbitrarily long. Their length gives their significance and significance is what represents the return values. If given in fractions, the result is in fractions.

### Strings
A single word  (anything but spaces and single quote) can be `'word` while a long string is `"long string" and anything but double quote. Escaping might be implemented.

### Sets
`{'a, 'b}` is a set of two elements, namely a and b.  Note `{a,b}` would have the values of a and b inserted. To enlarge a set, use the union operator. To remove, use the set subtraction operator. All such things generate new sets, but they can be saved to the old one. Sets have no order. Any listing of the set is random. But a sort order can be specified by applying a sort function to it.

### Tuples 
`(4, 5, 6)` is a tuple of three numbers. If `A` is the name, `A(1) = 4`. 

### Hash
These do not exist, but set of tuples approximates them. So `A = {(1, 2), (3, 4), (3, 4, 5)}` will be `A(1) = 2` and `A(3) = {4, (4,5)}`. 

### Booleans
`true` and `false`? 

### Functions

Set of tuples as hash and function.

`(x, y) -f-> (3x+4, 5x-2)`  Inline functions simulating the f above the arrow

`f(x,y) = 5x` inline as well

Block functions: 

	Thm awe. Given x, y, z then vex.
	Pf: x = x + 2. 
	Solve y = 5x + c for c. 
	vex = z*c.
	QED


Lemmas are helper functions and corollaries are partial filled functions.


## Control Flow


### if and switch
These are piecewise functions: `f(x) = {3 if x <0, 5 if x > 1}`

### For loop
Sequences:  a_i = [code] for i = 0 to n
Sum:  sum_i=0^n a_i

### While loop
limit 

---

The semicolon ends blocks. Certain constructs create blocks. Variables are scoped locally automatically.

Global scopre \x while \[name]x  would be x in the named scope

---------





