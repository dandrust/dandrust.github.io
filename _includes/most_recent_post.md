{% assign recent_post = site.posts.first %}

# {{ recent_post.title }}
{{ recent_post.date | date: "%-d %B %Y" }}

{{recent_post.content}}

---

Written by {{ site.author }} on {{ recent_post.date | date: "%-d %B %Y" }}

{% if recent_post.previous.url %}
Continue Reading: [{{ recent_post.previous.title | truncate: 35 }}]({{recent_post.previous.url}})

{% endif %}

[Browse more posts](/posts)
