import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../services/data.service';
import { Project } from '../models/project';
import { PaginationService } from '../services/pagination.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {

  private projects: Project[];

  // Pagination
  pageSize = 16;
  pages: number[];
  currentPage: number;
  totalPages: number;
  pagedItems: Project[];


  constructor(
    private dataService: DataService, 
    private pagerService: PaginationService,
    private activeRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.activeRoute.queryParams.subscribe(qp => {
      this.dataService.getProjects().subscribe(
        resp => {
          this.projects = resp.filter(p => {
            return !('tag' in qp) ||
              p.tags.map(t => t.toUpperCase()).includes(qp['tag']);
          }).sort((a, b) => {
            return a.id - b.id;
          }).reverse();
          
          this.setPage(1);
        },
        error => console.error(error)
      );
    });
  }

  setPage(page: number) {
    if (page < 1) {
      return;
    }
    const pagination = this.pagerService.getPagination(this.projects.length, page, this.pageSize);
    this.currentPage = page;
    this.pages = pagination.pages;
    this.totalPages = pagination.totalPages;
    this.pagedItems = this.projects.slice(pagination.startIndex, pagination.endIndex + 1);
  }

}
