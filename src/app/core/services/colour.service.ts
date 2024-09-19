import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ColourService {
    apiUrl: string = environment.API_URL;
    requestOptions = {
        headers: new HttpHeaders({
          'Accept-Version': 'v1'
        }),
      };

    constructor(private _httpClient: HttpClient) { }

    getAllColour(url): Observable<any> {
        return this._httpClient.get<any>(this.apiUrl + `colour` + url, this.requestOptions);
    }

    addColour(data:any): Observable<any>{
        return this._httpClient.post<any>(this.apiUrl + `colour`, data, this.requestOptions);
    }

    updateColour(id:any,data:any): Observable<any>{
        return this._httpClient.put<any>(this.apiUrl + `colour/${id}`, data, this.requestOptions);
    }

    getColourById(id:any): Observable<any>{
        return this._httpClient.get<any>(this.apiUrl + `colour/${id}`, this.requestOptions);
    }

    deleteColour(id:any): Observable<any>{
        return this._httpClient.delete<any>(this.apiUrl + `colour/${id}`, this.requestOptions)
    }
}
