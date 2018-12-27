---
layout: archive
title: Projects - Page 03
permalink: /projects/page-03
---

<br><br>

<div class="grid__wrapper">
    {% for post in site.projects offset:24 limit:12 %}
      {% include archive-single.html type="grid" %}
    {% endfor %}
</div>

<div class="archive__pagination">
  <a href="/projects/page-02">&laquo;</a>
  <a href="/projects/">1</a>
  <a href="/projects/page-02">2</a>
  <a class="active" href="/projects/page-03">3</a>
  <!--<a href="/projects/page-04">4</a>
  <a href="/projects/page-05">5</a>
  <a href="/projects/page-06">6</a>
  <a href="/projects/page-04">&raquo;</a>-->
</div> 