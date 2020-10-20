import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(private http: HttpClient) { }

  getPdf(url: string): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.set('Accept', 'application/pdf');
    headers.append('Set-Cookie', 'HttpOnly;Secure;SameSite=Strict');
    return this.http.get(url, {headers, responseType: 'blob'});
  }

}
