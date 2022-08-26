---
title: Game of Life in TSQL
date: 2019-09-22
tags:
    - sql
    - python
---

*Migrated post from [DEV.to](https://dev.to/barrettotte/coding-abomination-conway-s-game-of-life-in-tsql-40fd)*

![demo.gif](https://raw.githubusercontent.com/barrettotte/SQL-Game-of-Life/master/demo.gif)

GIF can be seen here
https://github.com/barrettotte/SQL-Game-of-Life/blob/master/demo.gif

One morning during my commute I was zoning out and realized I wanted to make a really dumb side project in SQL. One of my favorite things to do is use a language unconventionally and I thought implementing Game of Life was the perfect little project to do.

## Game of Life

If you are unfamiliar with Conway's Game of Life, I encourage to read more about it here https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life

The "algorithm" it uses is very simple. For each cell (pixel) in the environment (board), there are 4 rules for determining the next generation.
1. Any live cell with fewer than two live neighbours dies, as if by underpopulation.
2. Any live cell with two or three live neighbours lives on to the next generation.
3. Any live cell with more than three live neighbours dies, as if by overpopulation.
4. Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.

(Taken from the previously linked wiki page)

Through these simple rules, "organisms" can appear that exhibit different behavior. In my example, I implement a "blinker" and a "glider". They can also be found on the wiki page I linked.

## Implementation

For this project I could have used TSQL's built in PRINT function, but I wanted actual animation. To do this, I would have to leverage a little bit of Python to display the data that my stored procedure produced using the stdout buffer.

The stored procedure I made stores the cell data of each generation. If I take the cell data for each generation I can feed it into a drawing function to represent each frame in an animation.

Now, I will say the stored procedure runs terribly. But, **the goal was to get a basic glider to travel across the screen**. I am 100% sure I could have done some fancy JOINs or something. But, I just ended up using SQL like a general purpose language instead.

## Source

The project consisted of a single stored procedure and a python display script.
Everything can be found here https://github.com/barrettotte/SQL-Game-of-Life

## Coding Abominations

Its all well and good to spend your time programming useful things or learning new subjects. But, I think one of the funnest things to do is make really obscure and useless projects.

You would be surprised on how much you learn when making something super bizarre that has been implemented by only a few people. It forces you to think outside the box and touch parts of a language that you don't normally handle.

**I find that making a coding abomination every once in a while is a good anti-burnout exercise**. After finishing a fun coding abomination, I feel refreshed to tackle another side project. The important thing is to pick something you're relatively interested in, otherwise you're not going to have a good time.

Another fun abomination I made a few months back was a 2D perlin noise SVG generator using only XSLT https://github.com/barrettotte/XSLT-Perlin2D . 
I ended up learning a bunch of neat tricks in XSLT that I didn't even know were possible.