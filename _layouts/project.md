---
layout: default
---

# {{ page.title }}

{{ content }}

{% if page.repo %}
Code available on [GitHub]({{page.repo}})
{% endif %}

---

{% if site.categories[page.name] %}
## Posts related to this project
{% for post in site.categories[page.name] %}
[{{ post.title }}]({{post.url}}) - 
{{ post.date | date: "%-d %B %Y" }}
{% endfor %}
{% endif %}