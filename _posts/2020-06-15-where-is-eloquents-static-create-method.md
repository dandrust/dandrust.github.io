---
layout: post
title: Where is Eloquent's static create method?
date: 2020-06-15
category: posts
tags: php laravel
---

Lately I've been working on a Laravel 7 project using Eloquent ORM. While trying to unit test some services I kept running into the fact that the services had source-code dependencies on Eloquent Models. Ideally I'd like to inject the model as a dependency and take advantage of Laravel's dependency injection framework, but that would automatically instantiate the class. The particular service I was trying to get under test was using the static `Model::create` method. Since I'm dealing with a static method would dependency injection work?

Eloquent models look an awful lot like Laravel's facades - classes whose collection of static methods hide the details of a complex subsystem. Maybe this was just hiding away some details? A quick look at `Illuminate\Database\Eloquent\Model` showed no signs of inheritance from `Illuminate\Support\Facades\Facade`. Various Stack Overflow answers also reinforced that models were distinct from facades.

So where does this `create` method live, then? A quick search of the `Model` class revealed no static method called create. And it's traits?  Nothing.

In order to not get too far away from the problem at hand, I fired up a  `php artisan tinker` session. Given that there is no definition `static method create`, could I call create on a new instance of `Model`? I tried to create a new user calling `(new User)->create(...)`...and _it worked_!

At this point my question is answered. _Can I perform a create operation against an injected, instantiated Eloquent model?_ **_Yes_**. But why?

I'm used to working with Rails' ActiveRecord where, more or less, static methods on the model class represent querying operations against a table and instances of the model class represent a single row of data. Eloquent's model class is really breaking my assumptions at this point.

I figured this would be a great time to take a nice tour of the class looking for clues as to how a call to `create` is handled. All the way at the bottom of the class live two PHP [magic methods](https://www.php.net/manual/en/language.oop5.magic.php) `_call` and `_callStatic`.  The methods' DocBlocks noted that these methods handle dynamic calls to the model. So my calls to `create` as a static and member function must touch these methods. Interestingly, `_callStatic` creates a new instance and re-calls the method as a member function which mirrors what I'd done earlier in the tinker session.

The `_call` method was where my answer lied. It gets a new `Illuminate\Database\Eloquent\Builder` instance and forwards the call there. `Builder` includes lots of methods that I'd expect to see as static methods in the Active Record pattern like `find`, `findMany`, `findOrFail`, `first`, `firstOrCreate`, etc.

So when it comes to CRUD operations, almost any static method call to an Eloquent model will be passed along to a query builder. These static calls will actually be made as member calls, and in fact they can be made _only_ as member calls. So, contrary to my assumptions, a Eloquent model instance doesn't necessarily represent a row of table data. It _can_, but it doesn't have to.

I was able to type hint my service's Eloquent model dependency and perform my _create_ operation on the injected instance just fine.