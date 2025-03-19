import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { Country } from '../models/country';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  getCountries(url: string): Observable<Country[]> {
    return this.http.get<Country[]>(`${url}`).pipe(
      catchError(error => of((error)))
    );  
  }
  getOptions(url: string): Observable<any[]> {
    return this.http.get<any[]>(`${url}`).pipe(
      catchError(error => of((error)))
    );  
  }
}
