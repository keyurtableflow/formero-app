import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ProcessService {
    apiUrl: string = environment.API_URL;
    requestOptions = {
        headers: new HttpHeaders({
          'Accept-Version': 'v1'
        }),
      };

    constructor(private _httpClient: HttpClient) { }

    getAllProcess(url:any): Observable<any> {
        return this._httpClient.get<any>(this.apiUrl + `process` + url, this.requestOptions);
    }

    addProcess(data:any): Observable<any>{
        return this._httpClient.post<any>(this.apiUrl + `process`, data, this.requestOptions);
    }

    updateProcess(id:any,data:any): Observable<any>{
        return this._httpClient.put<any>(this.apiUrl + `process/${id}`, data, this.requestOptions);
    }

    getProcessById(id:any): Observable<any>{
        return this._httpClient.get<any>(this.apiUrl + `process/${id}`, this.requestOptions);
    }

    deleteProcess(id:any): Observable<any>{
        return this._httpClient.delete<any>(this.apiUrl + `process/${id}`, this.requestOptions)
    }

    // process Variable

    getAllProcessVariables(url: any): Observable<any> {
        return this._httpClient.get<any>(this.apiUrl + `process-variables` + url, this.requestOptions);
    }

    addProcessVariable(data: any): Observable<any> {
        return this._httpClient.post<any>(this.apiUrl + `process-variables`, data, this.requestOptions);
    }

    updateProcessVariable(id: any, data: any): Observable<any> {
        return this._httpClient.put<any>(this.apiUrl + `process-variables/${id}`, data, this.requestOptions);
    }

    getProcessVariableById(id: any): Observable<any> {
        return this._httpClient.get<any>(this.apiUrl + `process-variables/${id}`, this.requestOptions);
    }

    deleteProcessVariable(id: any): Observable<any> {
        return this._httpClient.delete<any>(this.apiUrl + `process-variables/${id}`, this.requestOptions)
    }
}
