{% for experience in include.experiences %}

{% unless experience.print %}
<div class='noprint' markdown='1'>
{% endunless}
### {{ experience.title }}
#### {{ experience.organization }} ({{ experience.date_string }})
<ul>
{% for detail in experience.description %}
<li>{{ detail }}</li>
{% endfor %}
</ul>
{% unless experience.print %}
</div>
{% endunless}
{% endfor %}
