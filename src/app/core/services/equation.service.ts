import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class EquationService {
    apiUrl: string = environment.API_URL;
    requestOptions = {
        headers: new HttpHeaders({
          'Accept-Version': 'v1'
        }),
      };

    constructor(private _httpClient: HttpClient) { }

    getAllEquation(url): Observable<any> {
        return this._httpClient.get<any>(this.apiUrl + `equation` + url, this.requestOptions);
    }

    addEquation(data:any): Observable<any>{
        return this._httpClient.post<any>(this.apiUrl + `equation`, data, this.requestOptions);
    }

    updateEquation(id:any,data:any): Observable<any>{
        return this._httpClient.put<any>(this.apiUrl + `equation/${id}`, data, this.requestOptions);
    }

    getEquation(id:any): Observable<any>{
        return this._httpClient.get<any>(this.apiUrl + `equation/${id}`, this.requestOptions);
    }

    deleteEquation(id:any): Observable<any>{
        return this._httpClient.delete<any>(this.apiUrl + `equation/${id}`, this.requestOptions)
    }
}
