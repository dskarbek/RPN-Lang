var RPNLang = function() {
	this.variables = {};
	this.stack = [];
};

RPNLang.prototype.evaluate = function(expr) {
	this.stack = [];
	this.inner_eval(expr);
	return this.stack.join(" ");
};

RPNLang.prototype.push_var = function(name, val) {
	if (! (name in this.variables)) {
		this.variables[name] = [];
	}
	this.variables[name].push(val);
};

RPNLang.prototype.peek_var = function(name) {
	if (! (name in this.variables) || this.variables[name].length === 0) {
		return undefined;
	}
	return this.variables[name][this.variables[name].length - 1];
};

RPNLang.prototype.pop_var = function(name) {
	if (! (name in this.variables) || this.variables[name].length === 0) {
		return undefined;
	}
	return this.variables[name].pop();
};

RPNLang.prototype.var_depth = function(name) {
	if (! (name in this.variables)) {
		return 0;
	}
	return this.variables[name].length;
};

RPNLang.prototype.inner_eval = function(expr) {
	if (typeof expr !== "string") {
		this.stack.push(expr);
		return;
	}
	expr = expr.trim()
	if (expr === "") {
		return;
	}
	var tokens = expr.split(/\s+/);
	var quoted = 0;
	tokens.forEach(function(token, index, array) {
		if (quoted) {
			if (token == "{") {
				quoted += 1;
			} else if (token == "}") {
				quoted -= 1;
			}
			if (quoted) {
				//add the token to the last value in the stack
				val = String(this.stack.pop());
				if (val) {
					val += " ";
				}
				val += token;
				this.stack.push(val);
			}
		} else {
			var args = this.popArgs(token);
			
			switch (token) {
				case "undef": this.stack.push(undefined); break;
				case "false": this.stack.push(false); break;
				case "true": this.stack.push(true); break;
				case "\"": this.stack.push(" "); break;
				case "$" : this.stack.push(this.stack.length); break;
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
				case ":=": this.push_var(args[1], args[0]); break;
				case "?" : this.stack.push(this.peek_var(args[0])); break;
				case "?!": this.stack.push(this.pop_var(args[0])); break;
				case "()": this.inner_eval(args[0]); break;
				case "->": this.inner_eval(this.peek_var(args[0])); break;
				case "?:": this.stack.push(args[0] == true ? args[1] : args[2]); break;
				case "?:->": this.inner_eval(args[0] == true ? args[1] : args[2]); break;
				case "#" : break;

				default  :
					//a token starting with $ gets the number of values pushed onto that variable
					if (String(token).substring(0, 1) == "$") {
						token = String(token).substring(1);
						this.stack.push(this.var_depth(token));
					} else {
						//trim off any leading backslash used to escape the token
						if (String(token).substring(0, 1) == "\\") {
							token = String(token).substring(1);
						}
						this.stack.push(token);
					}
					break;
			}
		}	
	}, this);
};

RPNLang.prototype.popArgs = function(token) {
	var args = [];
	
	switch (token) {
	case "?:":
	case "?:->":
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
	case ":=":
		args.unshift(this.stack.pop());
	case "#":
	case "!":
	case "~":
	case "?":
	case "?!":
	case "->":
	case "()":
		args.unshift(this.stack.pop());
		break;
	}
	return args;
};
