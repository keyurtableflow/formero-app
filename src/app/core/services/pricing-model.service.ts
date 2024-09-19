import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PricingModelService {
    apiUrl: string = environment.API_URL;
    requestOptions = {
        headers: new HttpHeaders({
          'Accept-Version': 'v1'
        }),
      };

    constructor(private _httpClient: HttpClient) { }

    getAllPricingModel(url): Observable<any> {
        return this._httpClient.get<any>(this.apiUrl + `pricing-model` + url, this.requestOptions);
    }

    addPricingModel(data:any): Observable<any>{
        return this._httpClient.post<any>(this.apiUrl + `pricing-model`, data, this.requestOptions);
    }

    updatePricingModel(id:any,data:any): Observable<any>{
        return this._httpClient.put<any>(this.apiUrl + `pricing-model/${id}`, data, this.requestOptions);
    }

    getPricingModel(id:any): Observable<any>{
        return this._httpClient.get<any>(this.apiUrl + `pricing-model/${id}`, this.requestOptions);
    }

    deletePricingModel(id:any): Observable<any>{
        return this._httpClient.delete<any>(this.apiUrl + `pricing-model/${id}`, this.requestOptions)
    }

        // pricing-model Variable

        getAllPricingModelVariables(url: any): Observable<any> {
            return this._httpClient.get<any>(this.apiUrl + `pricing-model-variables` + url, this.requestOptions);
        }

        addPricingModelVariable(data: any): Observable<any> {
            return this._httpClient.post<any>(this.apiUrl + `pricing-model-variables`, data, this.requestOptions);
        }

        updatePricingModelVariable(id: any, data: any): Observable<any> {
            return this._httpClient.put<any>(this.apiUrl + `pricing-model-variables/${id}`, data, this.requestOptions);
        }

        getPricingModelVariableById(id: any): Observable<any> {
            return this._httpClient.get<any>(this.apiUrl + `pricing-model-variables/${id}`, this.requestOptions);
        }

        deletePricingModelVariable(id: any): Observable<any> {
            return this._httpClient.delete<any>(this.apiUrl + `pricing-model-variables/${id}`, this.requestOptions)
        }
}
