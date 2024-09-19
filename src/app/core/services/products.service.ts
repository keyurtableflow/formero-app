import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ProductsService {
    apiUrl: string = environment.API_URL;
    requestOptions = {
        headers: new HttpHeaders({
          'Accept-Version': 'v1'
        }),
      };

    constructor(private _httpClient: HttpClient) { }

    getAllProducts(url): Observable<any> {
        return this._httpClient.get<any>(this.apiUrl + `product` + url, this.requestOptions);
    }

    addProducts(data:any): Observable<any>{
        return this._httpClient.post<any>(this.apiUrl + `product`, data, this.requestOptions);
    }

    updateProducts(id:any,data:any): Observable<any>{
        return this._httpClient.put<any>(this.apiUrl + `product/${id}`, data, this.requestOptions);
    }

    getProducts(id:any): Observable<any>{
        return this._httpClient.get<any>(this.apiUrl + `product/${id}`, this.requestOptions);
    }

    getStockableFromProduct(id:any): Observable<any>{
        return this._httpClient.get<any>(this.apiUrl + `product/stockable-products/${id}`, this.requestOptions);
    }

    deleteProducts(id:any): Observable<any>{
        return this._httpClient.delete<any>(this.apiUrl + `product/${id}`, this.requestOptions)
    }
}
