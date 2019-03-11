A method to print N numbers in the Fibonacci sequence, just to demonstrate some
simple recursion.
```
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
		10 fib ->
	}
test_fib :=
```
