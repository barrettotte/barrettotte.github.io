import { Component, OnInit } from '@angular/core';
import { GistDataService } from '../services/gistData.service';
import { Post } from '../models/post';
import { PaginationService } from '../services/pagination.service';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss']
})
export class PostsComponent implements OnInit {

  private allPosts: Post[];

  // Pagination
  pageSize = 4;
  pages: number[];
  currentPage: number;
  totalPages: number;
  pagedItems: Post[];


  constructor(private dataService: GistDataService, private pagerService: PaginationService) {}

  ngOnInit() {
    this.dataService.getPosts().subscribe(
      resp => {
        this.allPosts = resp.sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }).reverse();
        this.setPage(1);
      },
      error => console.error(error)
    );
  }

  setPage(page: number) {
    if (page < 1 || (this.pages && page > this.pages.length)) {
      return;
    }
    const pagination = this.pagerService.getPagination(this.allPosts.length, page, this.pageSize);
    this.currentPage = page;
    this.pages = pagination.pages;
    this.pagedItems = this.allPosts.slice(pagination.startIndex, pagination.endIndex + 1);
  }

}
