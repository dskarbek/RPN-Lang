# RPN-Lang
JavaScript implementation of an interpreter for a little language based on Reverse Polish Notation (RPN)

# Language
Evaluates a reverse polish notation expression against a set of variables. The expected format is that white-space separates each token. The basic run-time elements is the stack of tokens that are being parsed and a hash-table of variables that are being referenced.

## Constants
Token | Description
---- | -----
`val` | Any string that does not match an operation is interpreted as a literal value.
`\val` | A backslash is removed from the start of a constant and the rest of the token is always taken as a constant. Use this to escape an operator to be processed as a constant.

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
`"` | Push a single space as a token.

## Control operators
Token | Description
---- | -----
`?:` | Ternary, or if-then-else, operator: "test a b ?:" evals to `a` if `test` is true and to `b` if `test` is false.
`()` | Pop the top of stack and evaluates it as a RPNLang expression. Typically, the top of stack should be a `{ ... }` quoted expression.
`{ ... }` | Quotes the enclosed tokens into a single token on the stack. Can be nested. This is primarily useful for defining expressions to pass to the eval operator

## Variable operators
Token | Description
---- | -----
`?` | Evaluates the top of stack token as a variable name and pushes on its value in its place.
`=>` | This is the variable assignment operator: "5 a =>" sets a to 5.

# Samples
To help you pick up on the sort of things you can do, here's some sample programs.
## Fibonacci
This generates a fibonacci sequence of N values. In the sample, N is set to 10.
```
{
  b =>
  a =>
  a ?
  b ?
  a ? b ? +
} preserve_args_and_sum =>

{
  count =>
  count ? 0 !=
  {
    preserve_args_and_sum ? ()
    count ? 1 -
    fib_safe ? ()
  }
  { }
  ?: ()
} fib_safe =>

{
  count =>
  count ? 2 >=
  {
    0 1
    count ? 2 - 
    fib_safe ? ()
  }
  {
    count ? 1 ==
    0
    { Invalid argument, must be called with a positive number. }
    ?:
  }
  ?: ()
} fib =>

10 fib ? ()
```
## Reverse List
```
{
  $ 0 >
  {
    val =>
    result ? " . val ? .
    result =>
    rev_list_loop ? ()
  }
  {
    result ? ()
  }
  ?: ()
} rev_list_loop =>
{
  { } result =>
  rev_list_loop ? ()
} rev_list =>
1 2 3 4 5
rev_list ? ()
```
## Join
```
{
  delimiter =>
  $ 1 >
  {
    last =>
    prior =>
    prior ? delimiter ? last ? . .
    delimiter ? join ? ()
  }
  { }
  ?: ()
} join =>

1 2 3 \-
join ? ()
```
