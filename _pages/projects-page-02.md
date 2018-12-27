---
layout: archive
title: Projects - Page 02
permalink: /projects/page-02
---

<br><br>

<div class="grid__wrapper">
    {% for post in site.projects offset:12 limit:12 %}
      {% include archive-single.html type="grid" %}
    {% endfor %}
</div>

<div class="archive__pagination">
  <a href="/projects/">&laquo;</a>
  <a href="/projects/">1</a>
  <a class="active" href="/projects/page-02">2</a>
  <a href="/projects/page-03">3</a>
  <!--<a href="/projects/page-04">4</a>
  <a href="/projects/page-05">5</a>
  <a href="/projects/page-06">6</a>-->
  <a href="/projects/page-03">&raquo;</a>
</div> 