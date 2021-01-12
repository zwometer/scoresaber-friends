import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ScoreFormat } from './old.component';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private restApiUrl: string = "http://jp.dob.jp:3000"

  constructor(private http: HttpClient) { }

  getData(): Observable<ScoreFormat[]>{
    return this.http.get<ScoreFormat[]>(this.restApiUrl);
  }

  updateData() {
    return this.http.post(this.restApiUrl, 'refresh');
  }

}
