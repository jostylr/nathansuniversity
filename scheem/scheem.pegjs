start =
    expression


quote = 
  _ "'" _ e: expression
    {return ["quote", e]}

expression =
  _ a : atom _
	  {return a}
	/ quote 
  / _ "(" _ e: expression+ _ ")" _
    {return e}

validchar 
 	= [0-9a-zA-Z_?!+-=@#$%^&*/.]
    
atom = 
	chars:validchar+
        { return chars.join(""); }
        
_  =
  ws* comment+ ws*
  / ws*

ws = 
  [ \t\r\n]

comment = 
  ";;" [^\n\r]*
