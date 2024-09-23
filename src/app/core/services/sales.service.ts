import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  apiUrl: string = environment.API_URL;
  requestOptions = {
      headers: new HttpHeaders({
        'Accept-Version': 'v1'
      }),
    };

  constructor(private _httpClient: HttpClient) { }

  getAllService(url:any): Observable<any> {
      return this._httpClient.get<any>(this.apiUrl + `order`+ url, this.requestOptions);
  }

  getSalesById(id: any): Observable<any> {
    return this._httpClient.get<any>(this.apiUrl + `order/${id}`, this.requestOptions);
  }

  deleteSales(id:any): Observable<any>{
    return this._httpClient.delete<any>(this.apiUrl + `order/${id}`, this.requestOptions)
}

}
