---
layout: default
---

# {{ page.title }}
{{ page.date | date: "%-d %B %Y" }}

{{content}}

{% if page.tags %}
Tags: {{ page.tags | join: ", " }}
{% endif %}
