import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class MeasurementService {
    apiUrl: string = environment.API_URL;
    requestOptions = {
        headers: new HttpHeaders({
          'Accept-Version': 'v1'
        }),
      };

    constructor(private _httpClient: HttpClient) { }

    getAllMeasurement(url): Observable<any> {
        return this._httpClient.get<any>(this.apiUrl + `measurement` + url, this.requestOptions);
    }

    addMeasurement(data:any): Observable<any>{
        return this._httpClient.post<any>(this.apiUrl + `measurement`, data, this.requestOptions);
    }

    updateMeasurement(id:any,data:any): Observable<any>{
        return this._httpClient.put<any>(this.apiUrl + `measurement/${id}`, data, this.requestOptions);
    }

    getMeasurement(id:any): Observable<any>{
        return this._httpClient.get<any>(this.apiUrl + `measurement/${id}`, this.requestOptions);
    }

    deleteMeasurement(id:any): Observable<any>{
        return this._httpClient.delete<any>(this.apiUrl + `measurement/${id}`, this.requestOptions)
    }
}
