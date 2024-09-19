import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from 'app/core/user/user.types';
import { environment } from 'environments/environment.development';
import { map, Observable, ReplaySubject, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
    private _user: ReplaySubject<User> = new ReplaySubject<User>(1);
    apiUrl: string = environment.API_URL;

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
    }

    headerDict = {
        'Accept-Version': 'v1'
    }

    requestOptions = {
        headers: new HttpHeaders(this.headerDict),
    };

    set user(value: User) {
        // Store the value
        this._user.next(value);
    }

    get user$(): Observable<User> {
        return this._user.asObservable();
    }

    getCountries() {
        return this._httpClient.get('/assets/CountryCodes.json');
    }

    getAllRole(url){
        return this._httpClient.get(this.apiUrl + `role${url}`, this.requestOptions);
    }

    getAllUser(url:any): Observable<any> {
        return this._httpClient.get<any>(this.apiUrl + `user` + url, this.requestOptions);
    }


    getUser(id: any): Observable<any> {
        return this._httpClient.get<any>(this.apiUrl + `user/${id}`, this.requestOptions);
    }

    addUser(data: any): Observable<any> {
        return this._httpClient.post<any>(this.apiUrl + `user`, data, this.requestOptions);
    }

    updateUser(id: any, data: any): Observable<any> {
        return this._httpClient.patch<any>(this.apiUrl + `user/${id}`, data, this.requestOptions);
    }

    deleteUser(id: any): Observable<any> {
        return this._httpClient.delete<any>(this.apiUrl + `user/${id}`, this.requestOptions);
    }

    update(user: User): Observable<any> {
        return this._httpClient.patch<User>('api/common/user', { user }).pipe(
            map((response) => {
                this._user.next(response);
            }),
        );
    }
}
