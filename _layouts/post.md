---
layout: default
---

# {{ page.title }}
{{ page.date | date: "%-d %B %Y" }}

{{content}}

---

Written by {{ site.author }} on {{ page.date | date: "%-d %B %Y" }}

{% if page.previous.url %}
Continue Reading: [{{ page.previous.title | truncate: 35 }}]({{page.previous.url}})

{% endif %}

[Browse more posts](/posts)


