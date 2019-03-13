Following is a library of general helper methods that my other samples all use
```
{ Syntactic Sugar Methods } #

{ ?: () } if_else :=
{ { } ?: () } if :=
{ ?! # } unassign :=

{ Variable Manipulation Methods } #

{ increment_var_by #
    { Overwrites the variable with a new value that is an offset value from the
        current value.
        Expects 2 values:
        1. The variable name
        2. The amount to add to the variable (can be negative) } #
    value :=
    name :=
    name ? ?! value ?! + name ?! :=
} increment_var_by :=

{ -1 * increment_var_by -> } decrement_var_by :=

{ 1 increment_var_by -> } increment_var :=

{ -1 increment_var_by -> } decrement_var :=

{ flush_var #
    { Removes all assigned values of a variable
        Takes 1 parameter: the name of the variable } #
    if # :: ? ?$ 0 >
    {
        :: ? unassign ->
        flush_var ->
    }
    {
        #
    } if_else ->
} flush_var :=

{ overwrite_var #
    { Assigns a value to a variable overwriting any prior value rather than
        pushing a new value onto the variable's stack.
        Expects 2 arguments: (Same format as the := operator)
        1. The value to set
        2. The variable name } #
    name :=
    value :=
    name ? unassign ->
    value ?! name ?! :=
} overwrite_var :=


{ Loop & Branch Controls } #

{ for #
    { A for loop implementation that supports nested for loops 
        Expects 3 arguments on the stack.
        1. A condition, either a literal boolean value or a string to evaluate
        2. The loop increment_var code
        3. The loop body
        The loop body may refer to the "break" function which only exists
        inside of the loop and forces the loop to stop after this eval of
        the body. It does not short-circuit the body evaluation. } #
    _for_body :=
    _for_inc :=
    _for_cond :=

    { The break method is only defined inside of a call to for } #
    true _for_cont :=
    { break #
        false _for_cont overwrite_var ->
    } break :=

    { Internal Tail-Recursion method which does the looping } #
    { _for_loop #
        if # _for_cond -> _for_cont ? &&
        {
            _for_body ->
            _for_inc ->
            _for_loop ->
        } if ->
    } _for_loop :=
    _for_loop ->

    _for_body unassign ->
    _for_inc unassign ->
    _for_cond unassign ->
    _for_cont unassign ->
    _for_loop unassign ->
    break unassign ->
} for :=

{ for_n #
    { Syntactic sugar for the for loop.
        Supplies it's own index counter and simply calls the loop body n times.
        Expects 2 arguments:
        1. The number of times to execute it
        2. The loop body } #
    _for_n_body :=
    _for_n :=
    0 _for_i :=

    for # { _for_i ? _for_n ? < } { _for_i increment_var -> }
        _for_n_body ?
    for ->

    _for_n_body unassign ->
    _for_n unassign ->
    _for_i unassign ->
} for_n :=

{ while #
    { Syntactic Sugar for a while loop.
        Really, it's just a for loop with no increment_var code
        Expects 2 arguments:
        1. The condition
        2. The loop body } #
    { Add a null increment code block before the loop body } #
    loop_body := { } loop_body ?!
    for ->
} while :=

{ do_while #
    { Implements a do-while loop.
        Executes the loop body once before continuing to a normal while loop. Note
        that the order is opposite of a while loop, the condition comes second.
        Expects 2 arguments:
        1. The loop body
        2. The condition } #
    _do_while_cond :=
    _do_while_body :=

    { Because they might break during the first run of the body, we have
        to provide our own break function and check it. } #
    true _do_while_cont :=
    { false _do_while_cont overwrite_var -> } break :=

    _do_while_body ->

    break unassign ->

    if # _do_while_cont ?!
    {
        for # _do_while_cond ?! { }
            _do_while_body ?!
        for ->
    }
    else #
    {
        _do_while_cond unassign ->
        _do_while_body unassign ->
    } if_else ->
} do_while :=


{ Stack modifying methods } #

{ flush_stack_n #
    { Remove N elements from the stack.
        Takes 1 argument, the number to remove (which is not counted as
        one of the things being removed) } #
    { # } for_n ->
} flush_stack_n :=

{ var_to_stack_n #
    { Dumps N most recent assigned values of variable to the stack. This causes
        the values to be unassigned from the variable.
        Expects 2 arguments:
        1. The variable to dump to stack
        2. The number of values to extract } #
    n :=
    name :=
    for_n # n ? {
        name ? ?!
    } for_n ->
    n unassign ->
    name unassign ->
} var_to_stack_n :=

{ var_to_stack #
    { Syntactic sugar for dumping all values of a variable to the stack.
        Expects 1 argument: The variable to dump } #
    :: ?$
    var_to_stack_n ->
} var_to_stack :=

{ stack_n_to_var #
    { Assigns the N top values from the stack into a variable.
        Expects 2 arguments:
        1. The number of values to pick up
        2. The variable to assign to } #
    name :=
    n :=
    for_n # n ? {
        name ? :=
    } for_n ->
    n unassign ->
    name unassign ->
} stack_n_to_var :=

{ reverse_n #
    { Picks up the last N values from the stack, and puts them back
        down in reverse order.  Expects 1 argument, the number of items
        (not counting the argument) to reverse. } #
    n :=

    n ? list1 stack_n_to_var ->
    
    for_n # n ? {
        list1 ?! list2 :=
    } for_n ->

    list2 var_to_stack ->

    n unassign ->
} reverse_n :=

{ duplicate_n #
    { Duplicates the last N values on the stack.  The list of items is
        duplicated as a whole "1,2,3,1,2,3" not "1,1,2,2,3,3".
        Expects 1 argument: 
        Number of items (not counting the argument) to duplicate } #
    n :=

    n ? list stack_n_to_var ->

    for_n # n ? {
        list ? list ?! save :=
    } for_n ->

    for_n # n ? {
        save ?! list :=
    } for_n ->

    list var_to_stack ->

    n unassign ->
} duplicate_n :=

{ sort_n_by_fn #
    sort_fn :=
    n :=

    if # n ? 2 >=
    {
        { partition stack by a pivot value } #
        pivot :=
        0 num_before :=
        0 num_after :=
        for-n # n ? 1 -
        {
            if # :: pivot ? sort_fn ->
            {
                num_before increment_var ->
                before :=
            }
            else #
            {
                num_after increment_var ->
                after :=
            } if_else ->
        } for_n ->
        before num_before ? var_to_stack_n ->
        pivot ?
        after num_after ? var_to_stack_n ->

        { recursively sort the last part } #
        num_after ? sort_fn ? sort_n_by_fn ->

        { save off the now sorted tail, including the pivot,
          so that the first part is exposed } #
        num_after ? 1 + sorted stack_n_to_var ->

        { recursively sort the first part } #
        num_before ? sort_fn ? sort_n_by_fn ->

        { put back the sorted part to complete the operation } #
        sorted num_after ? 1 + var_to_stack_n ->

        pivot unassign ->
        num_before unassign ->
        num_after unassign ->
    } if ->
    { else, if n is less than 2, then it is already sorted } #

    n unassign ->
    sort_fn unassign ->
} sort_n_by_fn :=

{ { < } sort_n_by_fn -> } sort_n :=
{ $ { < } sort_n_by_fn -> } sort :=

{ reverse_var_stack #
    name :=
    name ? ?$ count :=

    name ? var_to_stack ->
    count ? reverse_n ->
    count ?! name ?! stack_n_to_var ->
} reverse_var_stack :=


{ String methods } #

{ string_join #
    { Joins the last N tokens into a string, separated by a delimiter
        Expects 2 arguments:
        1. The number of tokens (not counting the arguments) to join
        2. The delimiter value to use. } #
    delimiter :=
    n :=
    if # n ? 1 >
    {
        last :=
        delimiter ? last ?!
        . .
        n ? 1 - 
        delimiter ? 
        string_join ->
    } if ->
    n unassign ->
    delimiter unassign ->
} string_join :=


{ Unit Testing Framework Methods } #

{ test_expectation #
    { Each test method that will be assigned to test_fn must call this method to
        register the results of the test. You can manually call this in a code
        block that you assign to test_fn, or the test function as a short-hand
        and it will call this for you. } #
    case_label :=
    result :=
    !!
    tests increment_var ->
    if # result ?!
    { 
        pass increment_var ->
        { [ OK ] } " case_label ?! !!
    }
    else #
    {
        fail increment_var ->
        [FAIL] " case_label ?! !!
    } if_else ->
} test_expectation :=

{ drop_test_output #
    { If your test leaves output on the stack, call this method after you have
        Computed your true/false test success result.  If will keep the result
        on the top of the stack and flush the rest of it.  That way your normal
        output doesn't cloud the test } #
    result :=
    $ flush_stack_n ->
    result ?!
} drop_test_output :=

{ check_stack_is_matching_lists #
    { This method is useful in tests for checking the results of a method that
        resolves to a list of values.
        Expects n + 1 values, the n list values and then the value of n } #
    n :=
    n ? expected stack_n_to_var ->
    n ? actual stack_n_to_var ->
    true
    for_n # n ?!
    {
        expected ?! actual ?! == &&
    } for_n ->
} check_stack_is_matching_lists :=

{ register_test #
    { Creates a test function from a label and a code block that must resolve
        to a boolean result on the top of the stack that indicates whether the
        test passed or not. 
        Expects 2 arguments:
        1. The label for the test
        2. The body of the test code } #
    _test_body :=
    _test_label :=
    _test_body ?! 
    { drop_test_output -> } . \n .
    \{ . " . _test_label ?! . " . \} . " . { test_expectation -> } .
    test_fn :=
} register_test :=

{ run_tests #
    { Runs a collection of unit-tests stored in the test_fn variable. The tests
        are expected to call test_expectation internally or else, they won't be
        counted in the results. Tests are executed in the order they were assigned
        to test_fn. } #
    0 tests :=
    0 pass :=
    0 fail :=
    
    test_fn reverse_var_stack ->

    for_n # test_fn ?$
    {
        test_fn ->
        test_fn unassign ->
    } for_n ->

    !!
    tests ?! " Tests " Executed: !!
    pass ?! " Passed, " fail ?! " Failed. !!
    fail ? 0 == SUCCESS FAILED ?: !!
} run_tests :=


{ Unit Tests of Library Methods } #

test # { Double For Loop }
{
    1 i :=
        { i ? 7 < }
        { i increment_var -> }
        { 
            i ? 10 *
            i ? j :=
                true 
                { j increment_var -> }
                { 
                    j ?
                    if # j ? 2 % 0 == 
                    { 
                        break ->
                    } if ->
                }
            for ->
        }
    for ->
    expected #
    10 1 2 20 2 30 3 4 40 4 50 5 6 60 6
    15 check_stack_is_matching_lists ->
} register_test ->

test # { Do While Loop with break }
{
    do # {
        1 a :=
        a ? a ?! 1 +
        if # $ 4 >
        {
            break ->
        } if ->
    } { $ 10 < } do_while ->
    expected #
    1 2 1 2 1 2
    6 check_stack_is_matching_lists ->
} register_test ->

{ Uncomment to run the tests, leave commented if using as library } #
run_tests ->
```
