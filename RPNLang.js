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
				case "==": this.stack.push(args[0] == args[1]); break;
				case "!=": this.stack.push(args[0] != args[1]); break;
				case "<" : this.stack.push(args[0]*1 <  args[1]*1); break;
				case ">" : this.stack.push(args[0]*1 >  args[1]*1); break;
				case "<=": this.stack.push(args[0]*1 <= args[1]*1); break;
				case ">=": this.stack.push(args[0]*1 >= args[1]*1); break;
				case "||": this.stack.push(!!args[0] || !!args[1]); break;
				case "&&": this.stack.push(!!args[0] && !!args[1]); break;
				case "!" : this.stack.push( ! args[0] ); break;
				case "+" : this.stack.push(args[0]*1 +  args[1]*1); break;
				case "-" : this.stack.push(args[0] -  args[1]); break;
				case "*" : this.stack.push(args[0] *  args[1]); break;
				case "/" : this.stack.push(args[0] /  args[1]); break;
				case "\\": this.stack.push((args[0] / args[1]) | 0); break;
				case "%" : this.stack.push(args[0] %  args[1]); break;
				case "&" : this.stack.push(args[0] &  args[1]); break;
				case "|" : this.stack.push(args[0] |  args[1]); break;
				case "^" : this.stack.push(args[0] ^  args[1]); break;
				case "~" : this.stack.push( ~ args[0] ); break;
				case "<<": this.stack.push(args[0] << args[1]); break;
				case ">>": this.stack.push(args[0] >> args[1]); break;
				case "." : this.stack.push(String(args[0]) + args[1]); break;
				case "=>": this.variables[args[1]] = args[0]; break;
				case "?" : this.stack.push(this.variables[args[0]]); break;
				case "()": this.inner_eval(args[0]); break;
				case "?:": this.stack.push(args[0] == true ? args[1] : args[2]); break;

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
		args.unshift(this.stack.pop());
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
		args.unshift(this.stack.pop());
	case "!":
	case "~":
	case "?":
	case "()":
		args.unshift(this.stack.pop());
		break;
	case "=>":
		args.unshift(this.stack.pop());
		args.unshift(this.stack.pop());
		break;
	}
	return args;
};
