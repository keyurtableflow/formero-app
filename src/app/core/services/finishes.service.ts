import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FinishesService {
    apiUrl: string = environment.API_URL;
    requestOptions = {
        headers: new HttpHeaders({
          'Accept-Version': 'v1'
        }),
      };

    constructor(private _httpClient: HttpClient) { }

    getAllFinishes(url): Observable<any> {
        return this._httpClient.get<any>(this.apiUrl + `finishes` + url, this.requestOptions);
    }

    addFinishes(data:any): Observable<any>{
        return this._httpClient.post<any>(this.apiUrl + `finishes`, data, this.requestOptions);
    }

    updateFinishes(id:any,data:any): Observable<any>{
        return this._httpClient.put<any>(this.apiUrl + `finishes/${id}`, data, this.requestOptions);
    }

    getFinishesById(id:any): Observable<any>{
        return this._httpClient.get<any>(this.apiUrl + `finishes/${id}`, this.requestOptions);
    }

    deleteFinishes(id:any): Observable<any>{
        return this._httpClient.delete<any>(this.apiUrl + `finishes/${id}`, this.requestOptions)
    }

     // finishes Variable

     getAllFinishesVariables(url: any): Observable<any> {
        return this._httpClient.get<any>(this.apiUrl + `finishes-variables` + url, this.requestOptions);
    }

    addFinishesVariable(data: any): Observable<any> {
        return this._httpClient.post<any>(this.apiUrl + `finishes-variables`, data, this.requestOptions);
    }

    updateFinishesVariable(id: any, data: any): Observable<any> {
        return this._httpClient.put<any>(this.apiUrl + `finishes-variables/${id}`, data, this.requestOptions);
    }

    getFinishesVariableById(id: any): Observable<any> {
        return this._httpClient.get<any>(this.apiUrl + `finishes-variables/${id}`, this.requestOptions);
    }

    deleteFinishesVariable(id: any): Observable<any> {
        return this._httpClient.delete<any>(this.apiUrl + `finishes-variables/${id}`, this.requestOptions)
    }
}
