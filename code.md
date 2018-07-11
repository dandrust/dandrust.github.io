---
layout: default
title: Code
permalink: code
category: code
---

## `has-meta` gem
Solution for storing infrequently used attributes on ActiveRecord objects in MySQL without bloating tables. Includes convenience methods that let the attributes mimic any other attribute managed by ActiveRecord and scopes for simple querying. Hosted on [RubyGems](https://rubygems.org/gems/has-meta), code on [GitHub](https://github.com/protrainings/has-meta)

<br />
## The Elements of Computing Systems
After reading [Code](https://www.amazon.com/Code-Language-Computer-Hardware-Software/dp/0735611319) by Charles Petzold I wanted a better understanding of each layer that lies beneath the high-level code I write. I picked up a copy of [The Elements of Computing Systems](http://www.nand2tetris.org/book.php) (Nisan and Schocken) and I'm currently working through the text.

The latest deliverable is a program that translates stack-based VM code to assembly language to run on a virtual hardware platform developed in earlier chapters of the text. My implementation, written in Ruby, is [available on GitHub](https://www.github.com/dandrust/vm_translator).

Next up is writing a simple complier that parses a C-like language specification and outputs VM code that was dealt with in the previous project. Stay tuned!

<br />
## Filter Build Scheduler for 20 Liters
As part of Code For Good: Give Camp 2017 I worked on a Rails app to benefit [20 Liters](https://20liters.org/). You can see my contributions to the project [on GitHub](https://github.com/chiperific/filterbuildscheduler)

<br />
## Free Code Camp Challenges
<table>
  <tr>
    <th>Challenge</th>
    <th>Code</th>
    <th>Live link</th>
  </tr>
  {% for project in site.data.free_code_camp %}
  <tr>
    <td>{{ project.name }}</td>
    <td>
      <a href='{{ project.code_link }}' target='_blank'>
        <i class='fab fa-github'></i>
      </a>
    </td>
    <td>
      <a href='{{ project.live_link }}' target='_blank'>
        <i class='fas fa-external-link-square-alt'></i>
      </a>
    </td>
  </tr>
  {% endfor %}
</table>
