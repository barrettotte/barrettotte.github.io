---
layout: archive
title: "All Projects"
permalink: /projects/
---

Projects

<div class="grid__wrapper">
  {% for post in site.projects %}
    {% include archive-single.html type="grid" %}
  {% endfor %}
</div>