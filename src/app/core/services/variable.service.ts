import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class VariableService {
    apiUrl: string = environment.API_URL;
    requestOptions = {
        headers: new HttpHeaders({
          'Accept-Version': 'v1'
        }),
      };

    constructor(private _httpClient: HttpClient) { }

    getAllVariable(url): Observable<any> {
        return this._httpClient.get<any>(this.apiUrl + `variables` + url, this.requestOptions);
    }

    addVariable(data:any): Observable<any>{
        return this._httpClient.post<any>(this.apiUrl + `variables`, data, this.requestOptions);
    }

    updateVariable(id:any,data:any): Observable<any>{
        return this._httpClient.put<any>(this.apiUrl + `variables/${id}`, data, this.requestOptions);
    }

    getVariable(id:any): Observable<any>{
        return this._httpClient.get<any>(this.apiUrl + `variables/${id}`, this.requestOptions);
    }

    deleteVariable(id:any): Observable<any>{
        return this._httpClient.delete<any>(this.apiUrl + `variables/${id}`, this.requestOptions)
    }
}
