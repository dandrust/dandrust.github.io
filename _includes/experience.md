{% for experience in include.experiences %}

{% if experience.print %}
I SHOULD PRINT THIS
{% endif %}

### {{ experience.title }}
#### {{ experience.organization }} ({{ experience.date_string }})
<ul>
{% for detail in experience.description %}
<li>{{ detail }}</li>
{% endfor %}
</ul>

{% endfor %}
