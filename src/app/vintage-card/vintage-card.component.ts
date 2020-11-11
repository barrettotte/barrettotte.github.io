import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { VintageItem } from '../models/vintageItem';

@Component({
  selector: 'app-vintage-card',
  templateUrl: './vintage-card.component.html',
  styleUrls: ['./vintage-card.component.scss']
})
export class VintageCardComponent implements OnInit {

  @Input() vintageItem: VintageItem;

  constructor() { }

  ngOnInit(): void {
  }

}
