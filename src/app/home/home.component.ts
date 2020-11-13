import { Component, OnInit } from '@angular/core';
import { Project } from '../models/project';
import { GistDataService } from '../services/gistData.service';
import { CarouselItem } from '../models/carouselItem';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  featuredProjects: Project[] = [];
  carouselItems: CarouselItem[];

  constructor(private dataService: GistDataService) {
    this.dataService.getIndex().subscribe(
      data => {
        this.carouselItems = data.carousel;
        this.dataService.getFeaturedProjects().subscribe(fp => this.featuredProjects = fp.sort(this.sortByFeatured));
        console.log(this.featuredProjects);
      },
      error => {
        console.error(error);
      }
    );
    window.onbeforeunload = () => window.scrollTo(0, 0);
  }

  private sortByFeatured(a, b) {
    if (a.featured > b.featured) {
      return 1;
    }
    return (a.featured < b.featured) ? -1 : 0;
  }

  ngOnInit() {}

}
