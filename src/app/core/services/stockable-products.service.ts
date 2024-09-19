import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class StockableProductService {
    apiUrl: string = environment.API_URL;
    requestOptions = {
        headers: new HttpHeaders({
          'Accept-Version': 'v1'
        }),
      };

    constructor(private _httpClient: HttpClient) { }

    getAllStockableProducts(url): Observable<any> {
        return this._httpClient.get<any>(this.apiUrl + `stockable-product` + url, this.requestOptions);
    }

    addStockableProducts(data:any): Observable<any>{
        return this._httpClient.post<any>(this.apiUrl + `stockable-product`, data, this.requestOptions);
    }

    updateStockableProducts(id:any,data:any): Observable<any>{
        return this._httpClient.put<any>(this.apiUrl + `stockable-product/${id}`, data, this.requestOptions);
    }

    getStockableProducts(id:any): Observable<any>{
        return this._httpClient.get<any>(this.apiUrl + `stockable-product/${id}`, this.requestOptions);
    }

    deleteStockableProducts(id:any): Observable<any>{
        return this._httpClient.delete<any>(this.apiUrl + `stockable-product/${id}`, this.requestOptions)
    }
}
