{% for experience in include.experiences %}

### {{ experience.title }}
#### {{ experience.organization }} ({{ experience.date_string }})
<ul>
{% for detail in experience.description %}
<li>{{ detail }}</li>
{% endfor %}
</ul>

{% endfor %}
