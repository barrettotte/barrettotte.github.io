import { Component, OnInit } from '@angular/core';
import { Person } from '../models/person';
import { GistDataService } from '../services/gistData.service';
import { Occupation } from '../models/occupation';

@Component({
  selector: 'app-about-panel',
  templateUrl: './about-panel.component.html',
  styleUrls: ['./about-panel.component.scss']
})
export class AboutPanelComponent implements OnInit {
  
  links: Array<object>;
  person: Person;

  occupation: Occupation;
  occLanguages: Array<String>;
  occKeywords: Array<String>;
  

  constructor(private dataService: GistDataService) {
    this.dataService.getAbout().subscribe(
      resp => {
        this.person = resp.person;
        this.occupation = this.person.occupation;
        this.occLanguages = this.splitOccKeywords(this.occupation.languages);
        this.occKeywords = this.splitOccKeywords(this.occupation.keywords);
        this.links = resp.links;
      },
      error => {
        console.error(error);
      }
    );
  }

  ngOnInit() {}

  // Split keywords into equal rows of certain character length
  splitOccKeywords(words: Array<String>): Array<string> {
    const maxWidth = Math.ceil(this.occupation.title.length * .60);
    let rows = Array<string>();
    let row = '';

    words.forEach(kw => {
      if (row.length >= maxWidth){
        rows.push(row.slice(0, -1)); // discard trailing space
        row = '';
      }
      row += (kw + ', ');
    });
    // process last row
    if (row.length > 0){
      rows.push(row.slice(0, -2)); // discard trailing comma+space
    }
    return rows;
  }

}
