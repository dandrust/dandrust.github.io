{% assign recent_post = site.posts.first %}

# {{ recent_post.title }}
{{ recent_post.date | date: "%-d %B %Y" }}

{{recent_post.content}}

{% if page.tags %}
Tags: {{ page.tags | join: ", " }}
{% endif %}
