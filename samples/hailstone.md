Computes the hailstone series for any number.  The hailstone algorithm is to
determine if the value is even or odd and then divide by 2 if even, or if odd
multiply by 3 and add 1.  Repeat until you reach one.
```
{ hailstone #
    if # :: 2 % 0 ==
        { :: 2 / }
        { :: 3 * 1 + }
    if_else ->
    if # :: 1 !=
        { hailstone -> }
    if ->
} hailstone :=
```
