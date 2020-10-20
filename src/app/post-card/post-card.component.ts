import { Component, OnInit, Input } from '@angular/core';
import { Post } from '../models/post';

@Component({
  selector: 'app-post-card',
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.scss']
})
export class PostCardComponent implements OnInit {

  @Input() post: Post;
  postUrl: string;

  constructor() { }

  ngOnInit() {
    this.postUrl = (this.post.url) ? this.post.url : '/posts/' + this.post.id;
  }

}
