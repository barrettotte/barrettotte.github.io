import { Component, OnInit } from '@angular/core';
import { GistDataService } from '../services/gistData.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  aboutMe: Array<string>;
  goals: Array<string>;

  constructor(private dataService: GistDataService) {
    this.dataService.getAbout().subscribe(
      resp => {
        this.aboutMe = resp.summary;
        this.goals = resp.goals;
      },
      error => console.error(error)
    );
  }

  ngOnInit() {}

}
