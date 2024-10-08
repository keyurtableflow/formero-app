import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FileManagementService {
    apiUrl: string = environment.API_URL;
    requestOptions = {
        headers: new HttpHeaders({
          'Accept-Version': 'v1'
        }),
      };

    constructor(private _httpClient: HttpClient) { }

    uploadSingleFile(fileType:string,file:any): Observable<any>{
        const url = this.apiUrl + `file-management/file?folderName=${fileType}`;
        return this._httpClient.post<any>(url, file, this.requestOptions);
    }

    getFile(fileType:string,filename :string){
        return this.apiUrl + `file-management/file/${fileType}/${filename}`;
        // return this._httpClient.get<any>(url, this.requestOptions);
    }


}
