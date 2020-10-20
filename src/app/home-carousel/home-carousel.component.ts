import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-home-carousel',
  templateUrl: './home-carousel.component.html',
  styleUrls: ['./home-carousel.component.scss']
})
export class HomeCarouselComponent implements OnInit {

  @Input() carouselItems: Array<any>;

  constructor() {}

  ngOnInit() {}

}
