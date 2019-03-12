var RPNLang = function() {
    this.reset();
};

RPNLang.prototype.reset = function() {
    this.variables = {};
    this.stack = [];
    this.instruction_buffer = [];
    this.output = "";
};

RPNLang.prototype.get_debug_lines = function() {
    let joined_lines = [];
    this.instruction_buffer.forEach(function (tokens, index, array) {
        joined_lines.push(tokens.join(" "));
    });
    return joined_lines.join("\n");
};

RPNLang.prototype.get_variables = function() {
        let output = ""
        for (var key in this.variables) {
            if (this.variables[key].length > 0) {
                output = key + ": " +
                    this.variables[key].join(", ").replace(/\s+/g, " ") + "\n" +
                    output;
            }
        }
    return output;
};

RPNLang.prototype.get_stack = function() {
    return this.output + this.stack.join();
}

RPNLang.prototype.evaluate = function(expr) {
        if (this.instruction_buffer.length === 0) {
            this.start_debug(expr);
        }
    while (this.instruction_buffer.length > 0) {
        this.step_debug();
    }
};

RPNLang.prototype.start_debug = function(expr) {
    this.reset();
    this.instruction_buffer = this.tokenize(expr);
};

RPNLang.prototype.step_debug = function() {
    let quoted = 0;
    let breakpoint = false;
    do {
        let tokens = this.instruction_buffer.shift();
        if (tokens === undefined) {
            return;
        }
        [quoted, breakpoint] = this.apply_tokens(tokens, quoted);
    } while (quoted > 0 && ! breakpoint);
    return ! breakpoint;
};

RPNLang.prototype.step_over_debug = function() {
    //put temp breakpoint after this line
    let next_line = this.instruction_buffer.shift();
    this.instruction_buffer.unshift(["><"]);
    this.instruction_buffer.unshift(next_line);
    
    this.continue_debug();
}

RPNLang.prototype.continue_debug = function() {
    while (this.instruction_buffer.length > 0 && this.step_debug()) {
        //the condition is the work.  step_debug does the work and returns
        //whether we have hit a break point or not.
    }
}

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

RPNLang.prototype.tokenize = function(expr) {
    if (typeof expr !== "string") {
        return [[expr]];
    } else {
        expr = expr.trim();
        let tokens = [];
        expr.split(/\n/).forEach(function(line, index, array) {
            line = line.trim();
            if (line !== "") {
                tokens.push(line.split(/\s+/));
            }
        });
        return tokens;
    }
}

RPNLang.prototype.apply_tokens = function(tokens, quoted) {
    let breakpoint = false;
    let injected_tokens = undefined;
    for (var i = 0; i < tokens.length; ++i) {
        [quoted, breakpoint, injected_tokens] = this.apply_token(tokens[i], quoted);
        if (injected_tokens !== undefined || breakpoint) {
            //the current token is done
            ++i;

            //put back any tokens we haven't gotten to yet
            if (i < tokens.length) {
                this.instruction_buffer.unshift(tokens.slice(i));
            }

            //put the injected tokens at the top of the instruction buffer
            if (injected_tokens !== undefined) {
                while (injected_tokens.length > 0) {
                    this.instruction_buffer.unshift(injected_tokens.pop());
                }
            }

            //stop execution of the current set of tokens
            break;
        }
    }
    
    //if we're leaving with a quote in progress, that means there's a new-line in the
    //quote and we want to preserve that.
    if (quoted > 0) {
        this.stack.push(String(this.stack.pop()) + "\n");
    }
    
    return [quoted, breakpoint];
};

//return true if we should keep going, return false if we've pushed more
//instructions in front of this one.
RPNLang.prototype.apply_token = function(token, quoted) {
    if (quoted) {
        if (token == "{") {
            quoted += 1;
        } else if (token == "}") {
            quoted -= 1;
        }
        if (quoted) {
            //add the token to the last value in the stack
            let val = String(this.stack.pop());
            if (val) {
                    val += " ";
            }
            val += token;
            this.stack.push(val);
        }
        return [quoted, /*breakpoint=*/false, /*injected_tokens=*/undefined];
    }
    
    let breakpoint = false;
    let injected_tokens = undefined;
    let args = this.popArgs(token);

    switch (token) {
        case "><": breakpoint = true; break;
        case "!!": 
            //flush the stack to output, if there is a stack
            if (this.stack.length > 0) {
                this.output += this.stack.join("") + "\n";
                this.stack.length = 0;
            }
            break;
        case "undef": this.stack.push(undefined); break;
        case "false": this.stack.push(false); break;
        case "true": this.stack.push(true); break;
        case "\\n": this.stack.push("\n"); break;
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
        case "?:": this.stack.push(args[0] == true ? args[1] : args[2]); break;
        case "()": injected_tokens = this.tokenize(args[0]); break;
        case "->": injected_tokens = this.tokenize(this.peek_var(args[0])); break;
        case "?:->": injected_tokens = this.tokenize(args[0] == true ? args[1] : args[2]); break;
        case "#" : break; //pops one value off the stack

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

    return [quoted, breakpoint, injected_tokens];
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
