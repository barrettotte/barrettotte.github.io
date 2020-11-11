import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { Project } from '../models/project';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-project-card',
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProjectCardComponent implements OnInit {

  @Input() project: Project;
  tagList: SafeHtml;

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.tagList = this.sanitizer.bypassSecurityTrustHtml(
      this.project.tags.map(t => {
        return `<a href="/projects?tag=${encodeURIComponent(t.toUpperCase())}">${t}</a>`
      }).join(", ")
    );
  }

}
