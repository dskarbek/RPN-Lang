```
	{
		value :=
		name :=
		name ? ?! value ?! + name ?! :=
	}
increment_by :=

	{
		value :=
		name :=
		name ? ?! value ?! - name ?! :=
	}
decrement_by :=

	{ 1 increment_by -> }
increment :=

	{ 1 decrement_by -> }
decrement :=

	{ ?:-> }
if :=

	{ ?! # }
unassign :=

	{
		name :=
		value :=
		name ? ?! #
		value ?! name ?! :=
	}
overwrite :=

	{ A for loop implementation that supports nested for loops 
		Expects 3 arguments on the stack.
		1. A condition, either a literal boolean value or a string to evaluate
		2. The loop increment code
		3. The loop body
		The loop body may refer to the "break" function which only exists
		inside of the loop and forces the loop to stop after this eval of
		the body. It does not short-circuit the body evaluation. } #
	{
		{ Arguments } #
		_for_body :=
		_for_inc :=
		_for_cond :=
		{ Local Variables } #
		true _for_cont :=

			{ The break method is only defined inside of a call to for } #
			{ false _for_cont overwrite -> }
		break :=

			{ Internal Tail-Recursion method which does the looping } #
			{
					_for_cond -> _for_cont ? &&
					{
						_for_body ->
						_for_inc ->
						_for_loop ->
					}
					{ }
				?:->
			}
		_for_loop :=

		_for_loop ->

		{ Pop Arguments and Local Variables and internal functions } #
		_for_body unassign ->
		_for_inc unassign ->
		_for_cond unassign ->
		_for_cont unassign ->
		_for_loop unassign ->
		break unassign ->
	}
for :=

	{ Syntactic Sugar for a while loop.
		Really, it's just a for loop with no increment code
		Expects 2 arguments:
		1. The condition
		2. The loop body } #
	{
		_while_body :=
		{ }
		_while_body ?!
		for ->
	}
while :=

	{ Implements a do-while loop.
		Executes the loop body once before continuing to a normal while loop
		Expects 2 arguments:
		1. The loop body
		2. The condition } #
	{
		_do_while_cond :=
		_do_while_body :=

		{ Because they might break during the first run of the body, we have
			to provide our own break function and check it. } #
		true _do_while_cont :=
			{ false _do_while_cont overwrite -> }
		break :=

		_do_while_body ->

		break unassign ->
			_do_while_cont ?!
			{
				_do_while_cond ?!
				{ }
				_do_while_body ?!
				for ->
			}
			{
				_do_while_cond unassign ->
				_do_while_body unassign ->
			}
		?:->
	}
do_while :=

	{
		name :=
			{ name ? ? undef != }
			{ name ? unassign -> }
		while ->
		name unassign ->
	}
flush_var :=

	{
		n :=
		0 i overwrite ->
			{ i ? n ? < }
			{ i increment -> }
			{ list1 := }
		for ->
		0 i overwrite ->
			{ i ? n ? < }
			{ i increment -> }
			{ list1 ?! list2 := }
		for ->
		0 i overwrite ->
			{ i ? n ? < }
			{ i increment -> }
			{ list2 ?! }
		for ->
		i unassign ->
		n unassign ->
	}
reverse_last_n :=

	{ Joins the last N tokens into a string, separated by a delimiter
		Expects 2 arguments:
		1. The number of tokens to join
		2. The delimiter value to use. } #
	{
		delimiter :=
		n :=
			n ? 1 >
			{
				last :=
				prior :=
				prior ?! delimiter ? last ?! . .
				n ? 1 - delimiter ? join ->
			}
			{ }
		?:->
		n unassign ->
		delimiter unassign ->
	}
join :=

	{
		_fib_count :=
			_fib_count ? 2 >=
			{
				0 1
				_fib_count 2 decrement_by ->
					{ _fib_count ? 0 > }
					{ _fib_count decrement -> }
					{
						b := a :=
						a ? b ? a ?! b ?! +
					}
				for ->
			}
			{
					_fib_count ? 1 ==
					0
					{ Invalid argument, must be called with a positive number. }
				?:
			}
		?:->
		_fib_count unassign ->
	}
fib :=

	{
		1 i :=
			{ i ? 7 < }
			{ i increment -> }
			{ 
				i ? 10 *
				i ? j :=
					true 
					{ j increment -> }
					{ 
						j ?
							j ? 2 % 0 == 
							{ break -> } 
							{ } 
						?:->
					}
				for ->
			}
		for ->
	}
test_double_for_loop :=

	{
			{
				1
				{
					a := a ? a ?! 1 +
						$ 4 >
						{ break -> }
						{ }
					?:->
				}
			}
			{ true }
		do_while ->
	}
test_do_while :=

	{
		10 fib ->
	}
test_fib :=
```