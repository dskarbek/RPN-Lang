A Program that calculates the bowling score, given a series of throw values
```
is_spare #
{
    val := 
    val ? 
    val ?! 10 ==
} is_spare :=

add_bonus_pins #
{
    pins :=
    frame_score :=
    if # $ pins ? >=
    {
        pins ? duplicate_n ->
        frame_score ?!
        { + } pins ? for_n ->
    }
    else #
    {
        { frame score is a zero for now } #
        0
        frame_score unassign ->
    } ?:->
} add_bonus_pins :=

process_one_frame #
{
    running_total :=
    if # $ 1 >=
    {
        first_throw :=
        if # first_throw ? 10 ==
        {
            first_throw ?!
            2 add_bonus_pins ->
        }
        else #
        {
            first_throw ?!
            $ 2 >=
                { + }
                { # 0 }
            ?:->
            if # is_spare ->
            {
                1 add_bonus_pins ->
            }
            { } ?:->
        } ?:->
    }
    else #
    { } ?:->
    running_total ?! +
} process_one_frame :=

bowling_score #
{
    $ reverse_n ->
    0 completed_frames :=
    0 { push on the running total } #
        { $ 1 > }
        { 
            process_one_frame ->
            completed_frames increment_var ->
            if # completed_frames ? 10 >=
            {
                running_total :=
                # # { shouldn't be more than two extra throws to ignore } #
                running_total ?!
                break ->
            }
            { } ?:->
        }
    while ->
    completed_frames unassign ->
} bowling_score :=


{ Unit Tests } #

{
    1 3 bowling_score ->
    4 == { Single frame } test_expectation ->
} test_fn :=

{
    4 5 7
    bowling_score ->
    9 == { Partial frame } test_expectation ->
} test_fn :=

{
    3 7 3
    bowling_score ->
    13 == { Spare } test_expectation ->
} test_fn :=

{
    3 7
    bowling_score ->
    0 == { Open Spare } test_expectation ->
} test_fn :=

{
    3 7 3 2
    bowling_score ->
    18 == { Spare and next frame } test_expectation ->
} test_fn :=

{
    10 3 6
    bowling_score ->
    28 == { Strike (and frame after) } test_expectation ->
} test_fn :=

{
    10 3 
    bowling_score ->
    0 == { Open Strike 1 } test_expectation ->
} test_fn :=

{
    10  
    bowling_score ->
    0 == { Open Strike 2 } test_expectation ->
} test_fn :=

{
    10 10 10 10 10 10 10 10 10 10 10 10 
    bowling_score ->
    300 == { Perfect Game } test_expectation ->
} test_fn :=

{
    10 10 10 10 10 10 10 10 10 10 10 9 
    bowling_score ->
    299 == { Heartbreak Game } test_expectation ->
} test_fn :=

{
    10 10 10 10 10 10 10 10 10 10 6 3 
    bowling_score ->
    285 == { Tripping at the finish line } test_expectation ->
} test_fn :=

{
    10 10 10 10 10 10 10 10 10 9 1 1 
    bowling_score ->
    270 == { Tenth Frame Spare } test_expectation ->
} test_fn :=

{
    1 4 4 5 6 4 5 5 10 0 1 7 3 6 4 10 2 8 6
    bowling_score ->
    133 == { Sample Game } test_expectation ->
} test_fn :=

run_tests ->
```
