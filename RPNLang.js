/**
 * Evaluates a reverse polish notation expression against a set of variables
 * The expected format is that spaces separate each token.
 *
 * Constants:
 * 		val      Any string that does not match an operation is interpretted
 * 		         as a literal value.
 * 		\val     A backslash is removed from the start of a constant and the rest of
 * 		         the token is always taken as a constant.  Use this to escape an operator
 * 		         to be processed as a constant.
 *
 * Boolean operators:
 * 		==       Pop two values and push true if they are equal, else push false
 * 		!=       Pop two values and push false if they are equal, else push true
 * 		<        Pop two values and push whether the second one is less than the top:
 * 		         "6 3 <" is false; "3 6 <" is true
 * 		>        The following comparison operators all function similar to '<'
 * 		<=
 * 		>=
 * 		||       Pop two values and push the logical OR of them
 * 		&&       Pop two values and push the logical AND of them
 * 		!        Pop one value and push the logical NOT of them
 *
 * Numerical operators:
 * 		+        Pop two values and push their sum
 * 		-        Pop two values and subtract the first/top from the second:
 * 		         "3 4 -" is -1; "4 3 -" is 1
 * 		*        Pop two values and push their product
 * 		/        Pop two values and divide the second one by the first/top:
 * 		         "6 3 /" is 2; "3 6 /" is .5
 * 		\        Pop two values and do integer division (round down any fractional part)
 * 		         "6 3 \" is 2; "3 6 \" is 0
 * 		%        Pop two values and get the modulus value from division:
 * 		         "6 3 %" is 0; "3 6 %" is 3
 * 		&        Pop two values and push a bit-wise AND of them
 * 		|        Pop two values and push a bit-wise OR of them
 * 		^        Pop two values and push a bit-wise XOR of them
 * 		~        Pop one value and push the bit-wise NOT of it
 * 		<<       Pop two values and use the top one to shift the second one left (increase value).
 * 		>>       Pop two values and use the top one to shift the second one right (decrease value).
 *
 * String operators:
 * 		.        Concatenate top two values (as strings) on the stack and push the result.
 *
 * Control operators:
 * 		?:       Ternary, or if-then-else, operator: "test a b ?:" evals to a if test is true
 * 		         and to b if test is false.
 * 		()       Pop the top of stack, look it up as a variable and evaluate the value as a RPNLang
 * 		         expression.  If it does not match a variable, then it is just discarded. It takes the
 * 		         stack as it currently is (after it is popped) and leaves it in whatever state it does.
 * 		{ .. }   Quotes the enclosed tokens into a single token on the stack.  Can be nested.  This is
 * 		         primarily useful for defining expressions to pass to the eval operator
 *
 * Variable operators:
 * 		?        Evaluates the top of stack token as a variable name and pushes on
 * 		         its value in its place.
 * 		=>       This is the variable assignment operator: "5 a =>" sets a to 5.
 */
var RPNLang = function(vars)
{
	this.variables = vars
	this.stack = [];
};

RPNLang.prototype.evaluate = function(expr)
{
	this.stack = [];
	this.inner_eval(expr);
	return this.stack.join(" ");
};

RPNLang.prototype.inner_eval = function(expr)
{
	var tokens = expr.split(/\s+/);
	var quoted = 0;
	tokens.forEach(function(token, index, array)
	{
		if (quoted)
		{
			if (token == "{")
			{
				quoted += 1;
			}
			else if (token == "}")
			{
				quoted -= 1;
			}
			if (quoted)
			{
				//add the token to the last value in the stack
				val = String(this.stack.pop());
				if (val)
				{
					val += " ";
				}
				val += token;
				this.stack.push(val);
			}
		}
		else
		{
			var args = this.popArgs(token);
			
			switch (token)
			{
				case "{" : this.stack.push(""); quoted = 1; break;
				case "==": this.stack.push(args.pop() == args.pop()); break;
				case "!=": this.stack.push(args.pop() != args.pop()); break;
				case "<" : this.stack.push(args.pop() <  args.pop()); break;
				case ">" : this.stack.push(args.pop() >  args.pop()); break;
				case "<=": this.stack.push(args.pop() <= args.pop()); break;
				case ">=": this.stack.push(args.pop() >= args.pop()); break;
				case "||": this.stack.push(args.pop() || args.pop()); break;
				case "&&": this.stack.push(args.pop() && args.pop()); break;
				case "!" : this.stack.push( ! args.pop() ); break;
				case "+" : this.stack.push(args.pop()*1 +  args.pop()*1); break;
				case "-" : this.stack.push(args.pop() -  args.pop()); break;
				case "*" : this.stack.push(args.pop() *  args.pop()); break;
				case "/" : this.stack.push(args.pop() /  args.pop()); break;
				case "\\": this.stack.push((args.pop() / args.pop()) | 0); break;
				case "%" : this.stack.push(args.pop() %  args.pop()); break;
				case "&" : this.stack.push(args.pop() &  args.pop()); break;
				case "|" : this.stack.push(args.pop() |  args.pop()); break;
				case "^" : this.stack.push(args.pop() ^  args.pop()); break;
				case "~" : this.stack.push( ~ args.pop() ); break;
				case "<<": this.stack.push(args.pop() << args.pop()); break;
				case ">>": this.stack.push(args.pop() >> args.pop()); break;
				case "." : this.stack.push(String(args.pop()) + args.pop()); break;
				case "=>": this.variables[args.pop()] = args.pop(); break;
				case "?" : this.stack.push(this.variables[args.pop()]); break;
				case "()": this.inner_eval(args.pop()); break;
				case "?:": this.stack.push(args.pop() == true ? args.pop() : args.shift()); break;

				default  :
					//trim off any leading backslash used to escape the token
					if (String(token).substring(0, 1) == "\\")
					{
						token = String(token).substring(1);
					}
					this.stack.push(token);
					break;
			}
		}	
	}, this);
};

RPNLang.prototype.popArgs = function(token)
{
	var args = [];
	
	switch (token)
	{
	case "?:":
		args.push(this.stack.pop());
	case "==":
	case "!=":
	case "<":
	case ">":
	case "<=":
	case ">=":
	case "||":
	case "&&":
	case "+":
	case "-":
	case "*":
	case "/":
	case "\\":
	case "%":
	case "&":
	case "|":
	case "^":
	case "<<":
	case ">>":
	case ".":
		args.push(this.stack.pop());
	case "!":
	case "~":
	case "?":
	case "()":
		args.push(this.stack.pop());
		break;
	case "=>": //assignment we need in the opposite order
		args.unshift(this.stack.pop());
		args.unshift(this.stack.pop());
		break;
	}
	return args;
};
