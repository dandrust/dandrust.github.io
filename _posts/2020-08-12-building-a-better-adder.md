---
layout: post
title: Building a Better Adder
date: 2020-08-12
category: bradfield-architecture-course
---

I previously wrote about [building a binary adder with overflow detection]({% post_url 2020-07-22-building-an-adder-with-overflow-detection %}) in preparation for the Computer Architecture course at [Bradfield CS](https://bradfieldcs.com/). I didn't realize we'd do this as an in-class exercise. Doing this exercise with a live instructor brought a couple of concepts to the forefront:

## I wasn't wrong before, but...
My previous post documents my approach to building a full-adder circuit through a mixture of trail-and-error and analyzing truth tables. Surely, there are many roads that lead to Rome.  My solution certainly worked and the write up of a ripple-carry full adder on [Wikipedia](https://en.wikipedia.org/wiki/Adder_(electronics)#Full_adder) verified my solution. However, a suggestion during the in-class exercise to **_try using a half-adder while solving the full-adder exerecise_** made a lot more sense than my approach. Note the brevity and elegance of using an established abstraction instead of re-inventing the wheel:

My solution:
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
    Out(carry) = Inter(b) OR Inter(c)
```

The half-adder solution:
```
define halfAdder(a, b) : {out, carryOut}

INPUT
    In(1)
    In(2)
    In(carry)

INTERMEDIATES
    Inter(sumOne),   Inter(carryOne) = halfAdder(In(1),         In(2))
    Inter(sumFinal), Inter(carryTwo) = halfAdder(Inter(sumOne), In(carry))

OUTPUT
    Out        = Inter(sumFinal)
    Out(carry) = Inter(carryOne) OR Inter(carryTwo)
```

Granted, in my psuedo HDL the half-adder solution doesn't look _that_ much simpler but it certainly builds upon a previous abstraction -- a half adder built with the same elementary parts that my solution included.  And trust me, reasoning about a full-adder via a half adder was much easier that the 5+ pages of truth tables and gates I wrote out initially.

## Why it worked
My first question was, why?  What traits did my solution share with this new approach and are they fundamentally different?

Both solutions use two `AND` gates, two `XOR` gates, and a single `OR` gate.   What's more, notice that in my solution inputs `In(a)` and `In(b)` are both put through an `AND` and `XOR` gate. `Inter(a)` and `In(carry)` are treated the same -- put through an `AND` and `XOR` gate together.  In hindsight the abstraction is clear!


## What I've learned
### 1. Go ahead, stand on the shoulders of giants!
Reasoning about a full adder from basic logic gates was challenging and perhaps I took something away from that. However, a methodical approach that draws upon earlier abstractions makes a good lot of sense as well. Relying on a familiar abstraction seems to be a good bet in this case, especially when initially approaching the problem.

### 2. Self study is great, but a guide is invaluable
Originally I'd read The [Elements of Computing Systems](https://www.amazon.com/Elements-Computing-Systems-Building-Principles/dp/0262640686) based on the recommendation in Bradfield's [Teach Yourself CS](https://teachyourselfcs.com/) guide. That text does a great job of explaining the hardware/software interface, but in many of the exercises I was left to my own devices. Sure, I solved the problems. But what nuggets of wisdom or patterns did I fail to notice in my approach?  Having someone who's been down this path before is invaluable for correcting false assumptions, validating hypothesis, and challenging rough mental models.

