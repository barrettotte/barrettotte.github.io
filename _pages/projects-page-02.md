---
layout: archive
title: All Projects - Page 02
permalink: /projects/page-02
---

<div class="grid__wrapper">
  <br>
  <table>
    <tbody>
      <tr style="text-align: center">
        <td style="padding-bottom: 50px;">
          <button onClick="window.location.href='#'" id="test" class="btn btn--primary btn--x-large">Programming</button>
        </td>
        <td style="padding-bottom: 50px;">
          <button onClick="window.location.href='#'" id="test" class="btn btn--primary btn--x-large">Electronics</button>
        </td>
        <td style="padding-bottom: 50px;">
          <button onClick="window.location.href='#'" id="test" class="btn btn--primary btn--x-large">Everything Else</button>
        </td>
      </tr>
    </tbody>
  </table>
  <br>
</div>

<div class="grid__wrapper">
    {% for post in site.projects offset:16 limit:16 %}
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