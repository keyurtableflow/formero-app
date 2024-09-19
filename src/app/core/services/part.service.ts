import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PartService {
    apiUrl: string = environment.API_URL;
    requestOptions = {
        headers: new HttpHeaders({
          'Accept-Version': 'v1'
        }),
      };

    constructor(private _httpClient: HttpClient) { }

    getAllPart(url): Observable<any> {
        return this._httpClient.get<any>(this.apiUrl + `parts` + url, this.requestOptions);
    }

    addPart(data:any): Observable<any>{
        return this._httpClient.post<any>(this.apiUrl + `parts`, data, this.requestOptions);
    }

    updatePart(id:any,data:any): Observable<any>{
        return this._httpClient.put<any>(this.apiUrl + `parts/${id}`, data, this.requestOptions);
    }

    getPartById(id:any): Observable<any>{
        return this._httpClient.get<any>(this.apiUrl + `parts/${id}`, this.requestOptions);
    }

    deletePart(id:any): Observable<any>{
        return this._httpClient.delete<any>(this.apiUrl + `parts/${id}`, this.requestOptions)
    }
}
