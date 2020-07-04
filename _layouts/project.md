---
layout: default
---

# {{ page.title }}

{{ content }}

{% if page.repo %}
Code available on [GitHub]({{page.repo}})
{% endif %}

{% if page.tags %}
Tags: {{ page.tags | join: ", " }}
{% endif %}

---

{% if site.categories[page.name] %}
## Posts related to this project
{% for post in site.categories.text-editor %}
[{{ post.title }}]({{post.url}})
{% endfor %}
{% endif %}