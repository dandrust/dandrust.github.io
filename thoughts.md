---
layout: default
category: thoughts
---

{% for post in site.posts %}
  <div class='post-container'>
    <h2>
      <a href='{{ post.url }}'>{{ post.title }}</a>
    </h2>
    <small>
      by {{ post.author | default: site.author }} on {{ post.date | date: '%B %d, %Y' }}
    </small>
  </div>
{% endfor %}
