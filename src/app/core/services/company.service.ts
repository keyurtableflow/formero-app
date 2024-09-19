import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CompanyService {
    apiUrl: string = environment.API_URL;
    requestOptions = {
        headers: new HttpHeaders({
          'Accept-Version': 'v1'
        }),
      };

    constructor(private _httpClient: HttpClient) { }

    getAllCompany(url): Observable<any> {
        return this._httpClient.get<any>(this.apiUrl + `company` + url, this.requestOptions);
    }

    addCompany(data:any): Observable<any>{
        return this._httpClient.post<any>(this.apiUrl + `company`, data, this.requestOptions);
    }

    updateCompany(data:any): Observable<any>{
        return this._httpClient.put<any>(this.apiUrl + `company`, data, this.requestOptions);
    }

    getCompanyById(id:any): Observable<any>{
        return this._httpClient.get<any>(this.apiUrl + `company/${id}`, this.requestOptions);
    }

    deleteCompany(id:any): Observable<any>{
        return this._httpClient.delete<any>(this.apiUrl + `company/${id}`, this.requestOptions)
    }
}
