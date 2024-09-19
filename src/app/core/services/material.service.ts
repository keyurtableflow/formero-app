import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class MaterialService {
    apiUrl: string = environment.API_URL;

    requestOptions = {
        headers: new HttpHeaders({
            'Accept-Version': 'v1'
        }),
    };

    constructor(private _httpClient: HttpClient) { }

    getAllMaterial(url: any): Observable<any> {
        return this._httpClient.get<any>(this.apiUrl + `material` + url, this.requestOptions);
    }


    getMaterial(id: any): Observable<any> {
        return this._httpClient.get<any>(this.apiUrl + `material/${id}`, this.requestOptions);
    }

    addMaterial(data: any): Observable<any> {
        return this._httpClient.post<any>(this.apiUrl + `material`, data, this.requestOptions);
    }

    updateMaterial(id: any, data: any): Observable<any> {
        return this._httpClient.put<any>(this.apiUrl + `material/${id}`, data, this.requestOptions);
    }

    deleteMaterial(id: any): Observable<any> {
        return this._httpClient.delete<any>(this.apiUrl + `material/${id}`, this.requestOptions);
    }

    // material Variable

    getAllMaterialVariables(url: any): Observable<any> {
        return this._httpClient.get<any>(this.apiUrl + `material-variables` + url, this.requestOptions);
    }

    addMaterialVariable(data: any): Observable<any> {
        return this._httpClient.post<any>(this.apiUrl + `material-variables`, data, this.requestOptions);
    }

    updateMaterialVariable(id: any, data: any): Observable<any> {
        return this._httpClient.put<any>(this.apiUrl + `material-variables/${id}`, data, this.requestOptions);
    }

    getMaterialVariableById(id: any): Observable<any> {
        return this._httpClient.get<any>(this.apiUrl + `material-variables/${id}`, this.requestOptions);
    }

    deleteMaterialVariable(id: any): Observable<any> {
        return this._httpClient.delete<any>(this.apiUrl + `material-variables/${id}`, this.requestOptions)
    }
}
