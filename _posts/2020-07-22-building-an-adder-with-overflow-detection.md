---
layout: post
title: Building an adder with overflow detection
date: 2020-07-22
category: bradfield-architecture-course
---

It's been a while since I worked through the first part of The [Elements of Computing Systems](https://www.amazon.com/Elements-Computing-Systems-Building-Principles/dp/0262640686) and, in preparation for the Computer Architecture course at [Bradfield CS](https://bradfieldcs.com/) I was watching this [UC Berkely lecture](https://archive.org/details/ucberkeley_webcast_gJJeUFyuvvg) that touches on Two's Complement addition.  The point came up that you can detect an overflow or underflow by comparing the carry-in and carry-out values for the most significant bit.  That seemed like it would be easy to implement in an 8-bit adder built from an array of 1-bit adders.  So I decided to diagram an 8-bit adder with overlfow/underflow detection.  In the spirit of strengthening some neural pathways I refused to look at my notes from my previous reading of ECS.

## Half Adder
First, how to add two bits.  This was pretty simple.  First wrote out a truth table for the `Out` and `Out(carry)` bits:

| In(1)   | In(2)   | Out     | Out(carry) |
|:--------:|:-------:|:--------:|:-----------:|
| 0   | 0   | 0   | 0 |
| 0   | 1   | 1   | 0 |
| 1   | 0   | 1   | 0 |
| 1   | 1   | 0   | 1 |

The truth table patterns for the `Out` and `Out(carry)` bits look an awful lot like `XOR` and `AND` gates, respectively. So for a half adder that takes two inputs and provides an output with carry:

```
INPUT
    In(1)
    In(2)

OUTPUT 
    Out        = In(1) XOR In(2)
    Out(carry) = In(1) AND In(2)
```

This works for adding a single bit, but once we get to bit 2 we'll need to use the previous carry bit as input. 

## Full Adder
As before, I mapped out the end state:

| In(1)   | In(2)   | In(carry) | Out     | Out(carry) |
|:--------:|:-------:|:--------:|:---:|:-----------:|
|0|0|0|0|0|
|0|0|1|1|0|
|0|1|0|1|0|
|0|1|1|0|1|
|1|0|0|1|0|
|1|0|1|0|1|
|1|1|0|0|1|
|1|1|1|1|1|

I noticed a pattern early on. I could generalize the rule for `Out` and `Out(carry)` based on the number on input bits equal to 1:

|  | Out     | Out(carry) |
|--------:|:-------:|:--------:|
|If there are zero 1s|0|0|
|If there is one 1|1|0|
|If there are two 1s|0|1|
|If there are three 1s|1|1|

### The Out Bit
I started with the `Out` bit. The generalization above made me think that there may not be any distinction between any of the input bits. I would need to perform some operations that would allow for variance in the order of the bits so that `{0 0 1}`, `{0 1 0}`, and `{1 0 0}` would evaluate to the same value. Given that `AND` gates prefer all 1s and `OR` gates prefer 1s in general, I had a haunch that `XOR` might help out with the order issue:

```
# Zero 1s ===========
{0 0 0}
0 XOR 0 = 0
          0 XOR 0 = 0

# One 1 =============
{0 0 1}
0 XOR 0 = 0
          0 XOR 1 = 1
{0 1 0}
0 XOR 1 = 1
          1 XOR 0 = 1
{1 0 0}
1 XOR 0 = 1
          1 XOR 0 = 1

# Two 1s ============
{0 1 1}
0 XOR 1 = 1
          1 XOR 1 = 0
{1 0 1}
1 XOR 0 = 1
          1 XOR 1 = 0
{1 1 0}
1 XOR 1 = 0
          0 XOR 0 = 0

# Three 1s ==========
{1 1 1}
1 XOR 1 = 0
          0 XOR 1 = 1

```

That did it! So far for a full adder:
```
INPUT 
    In(1)
    In(2)
    In(carry)

INTERMEDIATES
    Inter(a) = In(1) XOR In(2)

OUTPUT
    Out        = Inter(a) XOR In(carry)
    Out(carry) = ?
```

### The Out(carry) bit
Now for the `Out(carry)` bit.  This one took me for a ride.  The fact that the presence of two or three 1s should evalute at 1 made me try a combination of `AND`s and `OR`s to no avail.  

I noticed that the `Out(carry)` column could be organized by switching the fourth row `{0 1 1}` for the fifth `{1 0 0}`:

| In(1)    | In(2)   | In(carry)|   Out(carry) |
|:--------:|:-------:|:--------:|:------------:|
|0         |        0|         0|             0|
|0         |        0|         1|             0|
|0       |      1|   0|       0|
|**_1_**       |      **_0_**|   **_0_**|       **_0_**|
|**_0_**       |      **_1_**|   **_1_**|       **_1_**|
|1       |      0|   1|       1|
|1         |        1|         0|             1|
|1         |        1|         1|             1|

This didn't bring out any patterns.

I tried to approach it as two problems like decimal addition.  You don't add three numbers at once. Instead you add two numbers and then consider the sum and the third number. I added columns for 
* `Inter(a)` defined as `In(1) XOR In(2)` above, and
* `Out` defined as `Inter(a) XOR In(carry)` above: 

| In(1)    | In(2)   | In(carry)| Inter(a) | Out         |   |   Out(carry) |
|:--------:|:-------:|:--------:|:--------:|:-----------:|:-:|:------------:|
|0         |        0|         0|         0|            0|...|             0|
|0         |        0|         1|         0|            1|...|             0|
|0         |        1|         0|         1|            1|...|             0|
|1         |        0|         0|         1|            1|...|             0|
|0         |        1|         1|         1|            0|...|             1|
|1         |        0|         1|         1|            0|...|             1|
|1         |        1|         0|         0|            0|...|             1|
|1         |        1|         1|         0|            1|...|             1|

Rows 3-6 where either `In(1)` or `In(2)` is 1 looked interesting.  I could see a pattern for those inputs:

_If either `In(1)` or `In(2)` are 1, `Inter(a) AND In(carry)` produces the correct `Out(carry)` value_...

| In(1)    | In(2)   | In(carry)| Inter(a) | Out         | Inter(a) AND In(carry)  |   |   Out(carry) |
|:--------:|:-------:|:--------:|:--------:|:-----------:|:-----------------------:|:-:|:------------:|
|0         |        0|         0|         0|            0|                       0| ...|            0|
|0         |        0|         1|         0|            1|                       0| ...|            0|
|0         |        1|         0|         1|            1|                       0| ...|            0|
|1         |        0|         0|         1|            1|                       0| ...|            0|
|0         |        1|   **_1_**|   **_1_**|            0|                 **_1_**| ...|      **_1_**|
|1         |        0|   **_1_**|   **_1_**|            0|                 **_1_**| ...|      **_1_**|
|1         |        1|         0|         0|            0|                       0| ...|            1|
|1         |        1|         1|         0|            1|                       0| ...|            1|

The only other scenarios that need to produce `Out(carry)` = 1 are the final two rows.  For those rows and only those rows `In(1) AND In(2)` is true.

Let's define two more intermediates:
* `Inter(b) = Inter(a) AND In(carry)` (as seen on the previous table), and
* `Inter(c) = In(1) AND In(2)`

| In(1)    | In(2)   | In(carry)| Inter(a) | Out         | Inter(b)  | Inter(c)    |   |   Out(carry) |
|:--------:|:-------:|:--------:|:--------:|:-----------:|:---------:|:-----------:|:-:|:------------:|
|0         |        0|         0|         0|            0|          0|            0|...|             0|
|0         |        0|         1|         0|            1|          0|            0|...|             0|
|0         |        1|         0|         1|            1|          0|            0|...|             0|
|1         |        0|         0|         1|            1|          0|            0|...|             0|
|0         |        1|         1|         1|            0|          1|            0|...|             1|
|1         |        0|         1|         1|            0|          1|            0|...|             1|
|**_1_**   |  **_1_**|         0|         0|            0|          0|      **_1_**|...|       **_1_**|
|**_1_**   |  **_1_**|         1|         0|            1|          0|      **_1_**|...|       **_1_**|

Now, all we have to do is transform `Inter(b) AND Inter(c)` to arrive at `Out(carry)`!

So the full adder is as follows:
```
INPUT 
    In(1)
    In(2)
    In(carry)

INTERMEDIATES
    Inter(a) = In(1) XOR In(2)
    Inter(b) = Inter(a) AND In(carry)
    Inter(c) = In(1) AND In(2)

OUTPUT
    Out        = Inter(a) XOR In(carry)
    Out(carry) = Inter(b) AND Inter(c)
```

## 8 Bits and Overflow detection
Two hours later...the whole point of this was to add over/underflow detection to a multi-bit adder according to the rule _you can detect an overflow or underflow by comparing the carry-in and carry-out values for the most significant bit_. The most significant bit will be the final adder and we can snatch it's carry input and carry output. To detect if those values are the same, we can `XOR` then `NOT` them.  Having defined a full adder, this was pretty simple:
```
define fullAdder(a, b, carryIn) : {out, carryOut}

INPUT
    In(1)   In(9)
    In(2)   In(10)
    In(3)   In(11)
    In(4)   In(12)
    In(5)   In(13)
    In(6)   In(14)
    In(7)   In(15)
    In(8)   In(16)

INTERMEDIATES
    Inter(outOne),   Inter(carryOne)   = fullAdder(In(1), In(9),  null)
    Inter(outTwo),   Inter(carryTwo)   = fullAdder(In(2), In(10), Inter(carryOne))
    Inter(outThree), Inter(carryThree) = fullAdder(In(3), In(11), Inter(carryTwo))
    Inter(outFour),  Inter(carryFour)  = fullAdder(In(4), In(12), Inter(carryThree))
    Inter(outFive),  Inter(carryFive)  = fullAdder(In(5), In(13), Inter(carryFour))
    Inter(outSix),   Inter(carrySix)   = fullAdder(In(6), In(14), Inter(carryFive))
    Inter(outSeven), Inter(carrySeven) = fullAdder(In(7), In(15), Inter(carrySix))
    Inter(outEight), Inter(carryEight) = fullAdder(In(8), In(16), Inter(carrySeven))
    
OUTPUT
    Out(1) = Inter(outOne)
    Out(2) = Inter(outTwo)
    Out(3) = Inter(outThree)
    Out(4) = Inter(outFour)
    Out(5) = Inter(outFive)
    Out(6) = Inter(outSix)
    Out(7) = Inter(outSeven)
    Out(8) = Inter(outEight)
    Out(overflowDetection) = NOT(Inter(carrySeven) XOR Inter(carryEight))
    Out(overflowFlag) = Inter(carrySeven)
```
This adder will take two 8-bit numbers as input and will output an 8-bit number, as well as an over/underflow detection bit and a flag to indicate if (0) an underflow was detected or (1) an overflow was detected.










