import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Person } from '../models/person';
import { map } from 'rxjs/operators';
import { Project } from '../models/project';
import { Post } from '../models/post';
import { VintageItem } from '../models/vintageItem';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  dataUrl = environment.dataUrl;

  constructor(private http: HttpClient) { }

  getIndex(): Observable<any> {
    return this.http.get<any>(`${this.dataUrl}/index.json`);
  }

  getHomeCarouselItems(): Observable<any> {
    return this.http.get<any>(`${this.dataUrl}/index.json`).pipe(map(r => r.carousel));
  }

  getProjects(): Observable<Array<Project>> {
    return this.http.get<any>(`${this.dataUrl}/projects.json`);
  }

  getFeaturedProjects(): Observable<Array<Project>> {
    return this.getProjects().pipe(map(r => r.filter(p => p.featured)));
  }

  getPosts(): Observable<Array<Post>> {
    return this.http.get<any>(`${this.dataUrl}/posts.json`);
  }

  getFeaturedPosts(): Observable<Array<Post>> {
    return this.getPosts().pipe(map(r => r.filter(p => p.featured)));
  }

  getAbout(): Observable<any> {
    return this.http.get<any>(`${this.dataUrl}/about.json`).pipe(map(r => r));
  }

  getPerson(): Observable<Person> {
    return this.getAbout().pipe(map(r => r.person));
  }

  getVintageItems(): Observable<Array<VintageItem>> {
    return this.http.get<any>(`${this.dataUrl}/vintage.json`).pipe(map(i => i))
  }

}
