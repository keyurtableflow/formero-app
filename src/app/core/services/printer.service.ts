import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PrinterService {
    apiUrl: string = environment.API_URL;
    requestOptions = {
        headers: new HttpHeaders({
          'Accept-Version': 'v1'
        }),
      };

    constructor(private _httpClient: HttpClient) { }

    getAllPrinter(url:any): Observable<any> {
        return this._httpClient.get<any>(this.apiUrl + `printer` + url, this.requestOptions);
    }

    addPrinter(data:any): Observable<any>{
        return this._httpClient.post<any>(this.apiUrl + `printer`, data, this.requestOptions);
    }

    updatePrinter(id:any,data:any): Observable<any>{
        return this._httpClient.put<any>(this.apiUrl + `printer/${id}`, data, this.requestOptions);
    }

    getPrinterById(id:any): Observable<any>{
        return this._httpClient.get<any>(this.apiUrl + `printer/${id}`, this.requestOptions);
    }

    deletePrinter(id:any): Observable<any>{
        return this._httpClient.delete<any>(this.apiUrl + `printer/${id}`, this.requestOptions)
    }



    // Printer Variable

    getAllPrinterVariables(url:any): Observable<any> {
        return this._httpClient.get<any>(this.apiUrl + `printer-variables` + url, this.requestOptions);
    }

    addPrinterVariable(data:any): Observable<any>{
        return this._httpClient.post<any>(this.apiUrl + `printer-variables`, data, this.requestOptions);
    }

    updatePrinterVariable(id:any,data:any): Observable<any>{
        return this._httpClient.put<any>(this.apiUrl + `printer-variables/${id}`, data, this.requestOptions);
    }

    getPrinterVariableById(id:any): Observable<any>{
        return this._httpClient.get<any>(this.apiUrl + `printer-variables/${id}`, this.requestOptions);
    }

    deletePrinterVariable(id:any): Observable<any>{
        return this._httpClient.delete<any>(this.apiUrl + `printer-variables/${id}`, this.requestOptions)
    }
}
