---
layout: post
title: Finind Missing Routes in Rails
date: 2018-04-24
categories: thoughts
tags: code
---
## Background:

I work on a Rails app for an online training company. Well, actually three Rails apps.  Recently, our team undertook a big maintenance project where code was reorganized and cleaned up between the three projects.  Users in our app follow a (mostly) linear flow, and some name spacing — including routes — had changed in the "core loop" of our user experience.  A number of changes happened to informational pages as well.  We have integration test coverage for most parts of our "core loop", but nothing else.  My project was to find every link in our code and make sure that it wouldn't break with the changes went live.

## The plan:

The most common way we define links in our project is by passing a `{controller: 'posts', action: 'index'}` hash.  I would need to look for these in our views and helpers. Once we had these hashes, I decided I would pass them to `url_for` to see if they returned a valid path.  If not, I would log the hash to a file and go fix it.

## The issues:

Style is not standardized in our code so I expected some variety:

- Value assignment might look `:like => this` or `like: this`
- Hashes that are explicitly wrapped in `{}` as well as loosey-goosey key/value pairs. Same with parenthesis
- We may pass variable as values so I needed a way to identify what was expected and fake data:
  - `id: @post`
  - `search_term: params[:search_term]`
  - `user_id: user.id`
  - `secret: my_secret`
  - `value: helper_function('param')`

## The search:

My first step was to write some regex to find key/value pairs being passed to a method like `url_for`

Matching the key wouldn't be too hard so I started with an expression that would match any of the values above:

`[\w:'"\.\/@\(\)\[\]-]*`

Then I added on to match a key/value pair with a hash rocket:

`:[\w]*\s*=>\s[\w:'"\.\/@\(\)\[\]-]*`

And another expression to match assignment with `:`

`[\w]*:\s[\w:'"\.\/@\(\)\[\]-]*`

Mix those together with `|` (or) and add a star at the end:

`((:[\w]*\s*=>\s[\w:'"\.\/@\(\)\[\]-]*)|([\w]*:\s[\w:'"\.\/@\(\)\[\]-]*))*`

and now we can find key/value arguments that are passed to `url_for`.  

This seems like a good place to abstract this away in a class of it's own:

```ruby
class HashMatcher
  
  attr_accessor :expression
  
  attr_reader :key, :value
  
  VALUE_WITH_QUOTES = /([\w:'"\.\/@\(\)\[\]-]*)/
  
  def initialize opts={}
    @key = opts[:key] || /[\w]*/
    @value = opts[:value] || VALUE_WITH_QUOTES
    @expression = /#{hash_rocket}|#{ruby_1_9}/
  end
    
  def hash_rocket
    /:(#{key})\s*=>\s#{value}/
  end
  
  def ruby_1_9
    /(#{key}):\s#{value}/
  end
    
end
```

In the end, however, we'll expect to see either `action` or `controller` as the first argument, followed by some params, so we'll match either of those keys first and then match any other key/value pairs that follow:

```ruby
action_controller_pair = HashMatcher
  .new(key: /action|controller/)
  .expression

generic_pair = HashMatcher
  .new
  .expression

url_hash_regex = /(#{action_controller_pair})(,\s*(#{generic_pair}))*/
```

## Rake'n it and Fakin' it:

I decided to write this utility as a rake task.  I follow Stuart Ellis's [guide to writing rake tasks](http://www.stuartellis.name/articles/rake/) which proved to be very helpful.  Here's a first draft of what the task will do, then we'll add some bells and whistles:

```ruby
desc 'identify routes defined by hashes that are not declared in routes.rb'
task :missing_routes => :environment do

  file_paths = FileList[
    "#{Rails.root}/app/helpers/**/*.rb",
    "#{Rails.root}/app/views/**/*.html.erb"
  ]
  
  file_paths.each do |file_path|
    
    puts file_path
    puts "=" * file_path.length

    File.read(file_path).scan(url_hash_regex) do |match|
      
      # Pass each match to url_for, log errors

    end

    puts "\n\n"    
    
  end
end
    
def url_hash_regex
  action_controller_pair = HashMatcher
    .new(key: /action|controller/)
    .expression

  generic_pair = HashMatcher
    .new
    .expression

  /(#{action_controller_pair})(,\s*(#{generic_pair}))*/
end
```

First things first - we need an actual hash to pass to `url_for` but `scan` gives us a string. 
 I'll implement a method to parse the matched string and build a hash:

```ruby
def sanitize string
  string
    .split(',')
    .map do |pair|
      resolve_key_and_value pair do |match|
        create_hash_from match
      end
    end
    .reduce(:merge)
end

def resolve_key_and_value pair, &block
  HashMatcher
  .new(value: :no_quotes)
  .expression
  .match(pair) do |match|
    yield match
  end
end

def create_hash_from match
  return match[1].present? ? 
    {match[1] => match[2]} :
    {match[3] => match[4]}
end
```

`HashMatcher` here accepts a `:no_quotes` option that will *not* match quotes on the value part of the hash. These matched values will be coerced into strings so we don't want to match a string literal and then end up with a string that contains quotation marks.  A quick modification to the original expression gives us a new constant to make available in the class:

```ruby
VALUE_WITHOUT_QUOTES = /['":]?([\w\.\/@\(\)\[\]-]*)['"]?/

def initialize opts={}
  @key = opts[:key] || /[\w]*/
  @value = if opts[:value] == :no_quotes
      VALUE_WITHOUT_QUOTES
    else
      opts[:value] || VALUE_WITH_QUOTES
    end
  @expression = /#{hash_rocket}|#{ruby_1_9}/
end
```

This implementation doesn't, however account for values that are actually expressions that need to be evaluated.  So let's throw in some checks to fake data that we can't evaluate here:

```ruby
def create_hash_from match
  return match[1].present? ? 
    { match[1] => fake_value(match[2]) } :
    { match[3] => fake_value(match[4]) }
end

def fake_value value
  value =~ /^@|\.|\[|\(/ ? "faked" : value
end
```

Now that we have a hash, let's go back in and actually pass the hash to `url_for:`

```ruby
...
  File.read(file_path).scan(url_hash_regex) do |match|
      
    hash = sanitize($&).merge({only_path: true})
      
    begin
      Rails.application.routes.url_for(hash)
    rescue => e
      puts e.message
    end
  end
...
```

And one final tweak to avoid a bunch of output noise  — let's wait to write anything until we know there is something:

```ruby
...
  errors = []

  File.read(file_path).scan(url_hash_regex) do |match|
      
    hash = sanitize($&).merge({only_path: true})
      
    begin
      Rails.application.routes.url_for(hash)
    rescue => e
      errors << e.message
    end
  end

  print_errors(file_path, errors) if errors.size > 0
  
...

def print_errors path, errors
  puts path
  puts "=" * path.length
  errors.each do |e|
    puts e
  end
  puts "\n\n"
end
    
```

## Makin' it (better):

This isn't a complete solution, but it worked for what we needed it to.  It lacks a couple of things, at least:

- In some places we omit the controller, we could try to guess it
- Similarly, this will likely break for namespaces controllers, like `admin/posts`
- Depending on the project, there may be links hiding out in controllers.  However, we'd have to decide how to either filter out or expect `render` calls.

## The Code

You can see the [complete code on GitHub](https://gist.github.com/dandrust/830eec5a841b707f1dac27017477bf15)
