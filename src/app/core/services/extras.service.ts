import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ExtrasService {
    apiUrl: string = environment.API_URL;
    requestOptions = {
        headers: new HttpHeaders({
          'Accept-Version': 'v1'
        }),
      };

    constructor(private _httpClient: HttpClient) { }

    getAllExtras(url): Observable<any> {
        return this._httpClient.get<any>(this.apiUrl + `extra` + url, this.requestOptions);
    }

    addExtras(data:any): Observable<any>{
        return this._httpClient.post<any>(this.apiUrl + `extra`, data, this.requestOptions);
    }

    updateExtras(id:any,data:any): Observable<any>{
        return this._httpClient.put<any>(this.apiUrl + `extra/${id}`, data, this.requestOptions);
    }

    getExtrasById(id:any): Observable<any>{
        return this._httpClient.get<any>(this.apiUrl + `extra/${id}`, this.requestOptions);
    }

    deleteExtras(id:any): Observable<any>{
        return this._httpClient.delete<any>(this.apiUrl + `extra/${id}`, this.requestOptions)
    }
}
