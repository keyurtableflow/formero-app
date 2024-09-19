import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CurrentStockService {
    apiUrl: string = environment.API_URL;
    requestOptions = {
        headers: new HttpHeaders({
          'Accept-Version': 'v1'
        }),
      };

    constructor(private _httpClient: HttpClient) { }

    getAllCurrentStock(url): Observable<any> {
        return this._httpClient.get<any>(this.apiUrl + `stock/current-stock` + url, this.requestOptions);
    }

    addCurrentStock(data:any): Observable<any>{
        return this._httpClient.post<any>(this.apiUrl + `stock`, data, this.requestOptions);
    }

    updateCurrentStock(id:any,data:any): Observable<any>{
        return this._httpClient.put<any>(this.apiUrl + `stock/${id}`, data, this.requestOptions);
    }

    getCurrentStock(id:any): Observable<any>{
        return this._httpClient.get<any>(this.apiUrl + `stock/${id}`, this.requestOptions);
    }

    deleteCurrentStock(id:any): Observable<any>{
        return this._httpClient.delete<any>(this.apiUrl + `stock/${id}`, this.requestOptions)
    }

    adjustStock(data:any): Observable<any>{
        return this._httpClient.put<any>(this.apiUrl + `stock/adjust-stock`, data, this.requestOptions);
    }


    getStockTurnOverReport(url){
        return this._httpClient.get<any>(this.apiUrl + `stock/per-product-turnover-report` + url, this.requestOptions);
    }

    getAllStockTurnOverReport(url){
        return this._httpClient.get<any>(this.apiUrl + `stock/total-turnover-report` + url, this.requestOptions);

    }

}
