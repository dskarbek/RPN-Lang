Following is a library of general helper methods that my other samples all use
```
{ Variable Manipulation Methods } #

increment_var_by #
{
    value :=
    name :=
    name ? ?! value ?! + name ?! :=
} increment_var_by :=

{ -1 * increment_var_by -> } decrement_var_by :=

{ 1 increment_var_by -> } increment_var :=

{ -1 increment_var_by -> } decrement_var :=

{ ?! # } unassign :=

flush_var #
{ Removes all assigned values of a variable
    Takes 1 parameter: the name of the variable } #
{
    name :=
    name ? unassign ->
    name ? ? undef !=
    {
        name ?! flush_var ->
    }
    { 
        name unassign ->
    } ?:->
} flush_var :=

overwrite_var #
{ Assigns a value to a variable overwritting any prior value rather than
    pushing a new value onto the variable's stack.
    Expects 2 paramenters: (Same format as the := operator)
    1. The value to set
    2. The variable name } #
{
    name :=
    value :=
    name ? ?! #
    value ?! name ?! :=
} overwrite_var :=


{ Loop Controls } #


for #
{ A for loop implementation that supports nested for loops 
    Expects 3 arguments on the stack.
    1. A condition, either a literal boolean value or a string to evaluate
    2. The loop increment_var code
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

    break #
    { The break method is only defined inside of a call to for } #
    { false _for_cont overwrite_var -> } break :=

    _for_loop #
    { Internal Tail-Recursion method which does the looping } #
    {
        if # _for_cond -> _for_cont ? &&
        {
            _for_body ->
            _for_inc ->
            _for_loop ->
        }
        { } ?:->
    } _for_loop :=
    _for_loop ->

    { Pop Arguments and Local Variables and internal functions } #
    _for_body unassign ->
    _for_inc unassign ->
    _for_cond unassign ->
    _for_cont unassign ->
    _for_loop unassign ->
    break unassign ->
} for :=

for_n #
{ Syntactic sugar for the for loop.
    Supplies it's own index counter and simply calls the loop body n times.
    Expects 2 arguments:
    1. The loop body
    2. The number of times to execute it } #
{
    _for_n :=
    _for_n_body :=
    0 _for_i :=
        { _for_i ? _for_n ? < }
        { _for_i increment_var -> }
        _for_n_body ?!
    for ->
    _for_n unassign ->
    _for_i unassign ->
} for_n :=

while #
{ Syntactic Sugar for a while loop.
    Really, it's just a for loop with no increment_var code
    Expects 2 arguments:
    1. The condition
    2. The loop body } #
{
    _while_body :=
    { }   { Add a null increment code block } #
    _while_body ?!
    for ->
} while :=

do_while #
{ Implements a do-while loop.
    Executes the loop body once before continuing to a normal while loop
    Expects 2 arguments:
    1. The loop body
    2. The condition 
    Note that the order is opposite of a while loop, the condition comes second } #
{
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
        _do_while_cond ?!
        { }
        _do_while_body ?!
        for ->
    }
    {
        _do_while_cond unassign ->
        _do_while_body unassign ->
    } ?:->
} do_while :=


{ Stack modifying methods } #

reverse_n #
{ Picks up the last N values from the stack, and puts them back
    down in reverse order.  Expects 1 argument, the number of items
    (not counting the argument) to reverse. } #
{
    n :=
        { list1 := }
    n ? for_n ->
        { list1 ?! list2 := }
    n ? for_n ->
        { list2 ?! }
    n ? for_n ->
    n unassign ->
} reverse_n :=

duplicate_n #
{ Duplicates the last N values on the stack.  The list of items is
    duplicated as a whole "1,2,3,1,2,3" not "1,1,2,2,3,3".
    Expects 1 argument: 
    Number of items (not counting the argument) to duplicate } #
{
    n :=
        { list := }
    n ? for_n ->
        { list ? list ?! save := }
    n ? for_n ->
        { save ?! list := }
    n ? for_n ->
        { list ?! }
    n ? for_n ->
    n unassign ->
} duplicate_n :=

flush_n #
{ Remove N elements from the stack.
    Takes 1 argument, the number to remove (which is not counted as
    one of the things being removed) } #
{
    n :=
    { # } n ?! for_n ->
} flush_n :=

reverse_var_stack #
{

} reverse_var_stack ->


{ String methods } #

string_join #
{ Joins the last N tokens into a string, separated by a delimiter
    Expects 2 arguments:
    1. The number of tokens (not counting the arguments) to join
    2. The delimiter value to use. } #
{
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
    }
    { } ?:->
    n unassign ->
    delimiter unassign ->
} string_join :=


{ Unit Testing Framework Methods } #

testing_init #
{
    0 tests :=
    0 pass :=
    0 fail :=
} testing_init :=

test_expectation #
{
    case_label :=
    result :=
    !!
    tests increment_var ->
    result ?!
        { pass increment_var -> { [ OK ] } " case_label ?! !! }
        { fail increment_var -> [FAIL] " case_label ?! !! }
    ?:->
} test_expectation :=

testing_results #
{
    !!
    fail ? 0 == success :=
    tests ?! Tests Executed:
    $ " string_join -> !!
    pass ?! Passed, fail ?! Failed.
    $ " string_join -> !!
    success ?! SUCCESS FAILED ?: !!
} testing_results :=

{
    result :=
    $ flush_n ->
    result ?!
} drop_test_output :=

run_tests #
{
    testing_init ->
    
    $test_fn num_tests :=
    forEach #
    {
        test_fn ?!
    } num_tests ? for_n ->

    num_tests ? reverse_n ->

    forEach #
    {
        test_fn :=
    } num_tests ? for_n ->

    forEach #
    {
        test_fn ?! ()
    } num_tests ? for_n ->
    testing_results ->
} run_tests :=


{ Unit Tests of Library Methods } #

test_double_for_loop #
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
                    } 
                    { } ?:->
                }
            for ->
        }
    for ->
    $ 15 == 
    drop_test_output ->
    { Double For Loop } test_expectation ->
} test_fn :=

test_do_while #
{
        {
            1
                a := a ? a ?! 1 +
                        $ 4 >
                        { break -> }
                        { }
                ?:->
        }
        { $ 10 < }
    do_while ->
    $ 6 == 
    drop_test_output ->
    { Do While Loop with break } test_expectation ->
} test_fn :=

{ Uncomment to run the tests, leave commented if using as library } #
run_tests ->
```
