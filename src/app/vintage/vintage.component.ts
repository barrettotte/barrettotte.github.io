import { Component, OnInit } from '@angular/core';
import { VintageItem } from '../models/vintageItem';
import { GistDataService } from '../services/gistData.service';

@Component({
  selector: 'app-vintage',
  templateUrl: './vintage.component.html',
  styleUrls: ['./vintage.component.scss']
})
export class VintageComponent implements OnInit {

  vintageItems: VintageItem[];

  constructor(private dataService: GistDataService) {}

  ngOnInit(): void {
    this.dataService.getVintageItems().subscribe(
      resp => {
        this.vintageItems = resp.sort((a, b) => {
          return a.id - b.id
        }).reverse();
      },
      error => console.error(error)
    );
  }

}
