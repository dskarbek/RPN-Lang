# RPN-Lang
JavaScript implementation of an interpreter for a little language based on Reverse Polish Notation (RPN)

# Language
Evaluates a reverse polish notation expression against a set of variables. The expected format is that white-space separates each token. The basic run-time elements are the stack of parsed tokens and a hash-table of variables.

## Constants
Token | Description
---- | -----
`val` | Any string that does not match an operation is interpreted as a literal value.
`\val` | A backslash is removed from the start of a constant and the rest of the token is always taken as a constant. Use this to escape an operator to be processed as a constant.
`#` | Pops and discards the last token on the stack, use along with `{ ... }` to make comments
`true` | A boolean true value.
`false` | A boolean false value. These are the only words that are reserved symbols.
`undef` | The value a variable has before it is assigned to.
`"` | Push a single space onto the stack.
`\n` | Push a new line character onto the stack.
`{ ... }` | Quotes the enclosed tokens into a single token on the stack. Can be nested.
`::` | Clone the top token on the stack.  Useful for when you want to calculate a result based on it but also keep it.

## Boolean operators
Token | Description
---- | -----
`==` | Pop two values and push true if they are equal, else push false
`!=` | Pop two values and push false if they are equal, else push true
`<` | Pop two values and push whether the second one is less than the top: "6 3 <" is false; "3 6 <" is true
`>` | The following comparison operators all function similar to '<'
`<=` |
`>=` |
`\|\|` | Pop two values and push the logical OR of them
`&&` | Pop two values and push the logical AND of them
`!` | Pop one value and push the logical NOT of them

## Numerical operators
Token | Description
---- | -----
`+` | Pop two values and push their sum
`-` | Pop two values and subtract the first/top from the second: "3 4 -" is -1; "4 3 -" is 1
`*` | Pop two values and push their product
`/` | Pop two values and divide the second one by the first/top: "6 3 /" is 2; "3 6 /" is .5
`\` | Pop two values and do integer division (round down any fractional part): "6 3 \" is 2; "3 6 \" is 0
`%` | Pop two values and get the modulus value from division: "6 3 %" is 0; "3 6 %" is 3
`&` | Pop two values and push a bit-wise AND of them
`\|` | Pop two values and push a bit-wise OR of them
`^` | Pop two values and push a bit-wise XOR of them
`~` | Pop one value and push the bit-wise NOT of it
`<<` | Pop two values and use the top one to shift the second one left (increase value).
`>>` | Pop two values and use the top one to shift the second one right (decrease value).
`$` | Pushes the current stack size (prior to pushing) onto the stack.

## String operators
Token | Description
---- | -----
`.` | Concatenate top two values (as strings) on the stack and push the result.

## Control operators
Token | Description
---- | -----
`?:` | Ternary, or if-then-else, operator: "test a b ?:" evals to `a` if `test` is true and to `b` if `test` is false.
`()` | Pop the top of stack and evaluates it as a RPNLang expression. Typically, the top of stack should be a `{ ... }` quoted expression.
`<>` | Has no effect on the program, but sets a breakpoint so if the interpreter is running in a debug mode it can choose to stop at this point.
`!!` | Flushes the stack to output, joins all current values without delimiters and adds a newline to the end. If the stack is empty, does nothing.

## Variable operators
Token | Description
---- | -----
`:=` | This is the variable assignment operator: "5 a :=" sets a to 5. Previously assigned values aren't actually lost, each variable is actually a stack, and this pushes on a new value.
`?` | Evaluates the top of stack token as a variable name and pushes on its value in its place. This is a "peek" on the variable stack.
`?!` | Takes the top of stack token as a variable name and un-assigns the last assigned value. The previously assigned value of the variable will now be in place. The value that was un-assigned is pushed onto the stack. Use `#` if you want to ignore it. This is the "pop" of the variable stack.
`?$` | Evaluates the top of stack token as a variable name and pushes on the number of values that have been assigned to it. This is the "stack depth" of the variable.
`->` | Evaluates the top of stack token as a variable that resolves to a value that is evaluated as an RPNLang expression. Literally equivallent to `? ()`
