import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PromotionService {
    private apiUrl: string = environment.API_URL + 'promotions';
    private requestOptions = {
        headers: new HttpHeaders({
            'Accept-Version': 'v1'
        }),
    };

    constructor(private _httpClient: HttpClient) { }

    getPromotions(skip_pagination: boolean = true, orderby = '_id', sort?: string, page?: number, limit?: number, search?: string, status: number = 1): Observable<any> {
        return this._httpClient.get<any>(this.apiUrl, { ...this.requestOptions, params: { search, page, limit, sort, skip_pagination, orderby, status } });
    }

    createPromotion(data: Record<string, any>): Observable<any> {
        return this._httpClient.post<any>(this.apiUrl, data, { ...this.requestOptions });
    }

    getPromotion(id: string): Observable<any> {
        return this._httpClient.get<any>(this.apiUrl + `/${id}`, { ...this.requestOptions });
    }
    updatePromotion(id: string, data: Record<string, any>): Observable<any> {
        return this._httpClient.put<any>(this.apiUrl + `/${id}`, data, { ...this.requestOptions });
    }
}
