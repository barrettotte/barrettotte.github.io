import { Component, OnInit, Input } from '@angular/core';
import { Project } from '../models/project';

@Component({
  selector: 'app-project-card',
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.scss'],
})
export class ProjectCardComponent implements OnInit {

  @Input() project: Project;
  primaryTag: string;

  constructor() { }

  ngOnInit() {
    this.primaryTag = encodeURIComponent(this.project.tags[0].toUpperCase());
  }

  getBadgeColor(tag: string, normal = true) {
    // TODO: make service or something for color
    return (normal) ? '#26883e' : '#5ED467';
  }

}
