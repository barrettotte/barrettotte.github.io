import { Component, OnInit } from '@angular/core';
import { VintageItem } from '../models/vintageItem';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-vintage',
  templateUrl: './vintage.component.html',
  styleUrls: ['./vintage.component.scss']
})
export class VintageComponent implements OnInit {

  vintageItems: VintageItem[];

  constructor(private dataService: DataService) {}

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
