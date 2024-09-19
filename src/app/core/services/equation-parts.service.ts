import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class EquationPartsService {
    apiUrl: string = environment.API_URL;
    requestOptions = {
        headers: new HttpHeaders({
          'Accept-Version': 'v1'
        }),
      };

    constructor(private _httpClient: HttpClient) { }

    getAllEquationParts(url): Observable<any> {
        return this._httpClient.get<any>(this.apiUrl + `equation-parts` + url, this.requestOptions);
    }

    addEquationParts(data:any): Observable<any>{
        return this._httpClient.post<any>(this.apiUrl + `equation-parts`, data, this.requestOptions);
    }

    updateEquationParts(id:any,data:any): Observable<any>{
        return this._httpClient.put<any>(this.apiUrl + `equation-parts/${id}`, data, this.requestOptions);
    }

    getEquationParts(id:any): Observable<any>{
        return this._httpClient.get<any>(this.apiUrl + `equation-parts/${id}`, this.requestOptions);
    }

    deleteEquationParts(id:any): Observable<any>{
        return this._httpClient.delete<any>(this.apiUrl + `equation-parts/${id}`, this.requestOptions)
    }

    getAllOperators(url){
        return this._httpClient.get<any>(this.apiUrl + `Operator` + url, this.requestOptions);
    }
}
