{% assign recent_post = site.posts.first %}

<small>{{ recent_post.date | date: "%-d %B %Y" }}</small>
<h1>{{ recent_post.title }}</h1>

<p class="view">by {{ recent_post.author | default: site.author }}</p>

{{recent_post.content}}

{% if recent_post.tags %}
  <small>tags: <em>{{ recent_post.tags | join: "</em> - <em>" }}</em></small>
{% endif %}
