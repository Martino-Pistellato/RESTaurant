import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, throwError, catchError  } from 'rxjs';
import jwt_decode from "jwt-decode";
import { createOptions, handleError } from 'src/app/utils';

export enum RoleTypes{
  ADMIN,
  CASHIER,
  BARMAN,
  COOK,
  WAITER
}

export interface Token{
  token: string
}

export interface TokenData{
  name:   string,  
  role:   RoleTypes,
  email:  string,
  id:    string
};

export interface User{
  _id:        string,
  name:       string,  
  role:       RoleTypes,
  email:      string,
  password:   string,
  totalWorks: string[]
};

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private _token: string;
  private _user_data: TokenData | null;

  constructor(private http: HttpClient, private router: Router) { 
    const loadedtoken = localStorage.getItem('user_token');

    if ( !loadedtoken || loadedtoken.length < 1 ) {
      console.log("No token found in local storage");
      this._token = "";
      this._user_data = null;
    } else {
      this._token = loadedtoken as string;
      this._user_data = jwt_decode<TokenData>(this.token);
      console.log("JWT loaded from local storage.")
    }
  }

  login(email: string, password: string): Observable<any>{
    const options = {
      headers: new HttpHeaders({
        authorization: 'Basic ' + btoa( email + ':' + password),
        'cache-control': 'no-cache',
        'Content-Type':  'application/x-www-form-urlencoded',
      })
    };
    
    return this.http.get('https://localhost:3000/login',  options).pipe(
      tap( (data) => {
        console.log("Login successful");
        this._token = (data as Token).token;
        this._user_data = jwt_decode<TokenData>(this._token);
        localStorage.setItem('user_token', this._token);
      }),
      catchError( (err) => {
        console.log("Login failed");
        return throwError(()=>{ return err });
      })
    );
  }

  get role(): RoleTypes{
    return (this._user_data as TokenData).role;
  }

  get token(): string{
    return this._token;
  }

  get user_data(): TokenData | null{
    return this._user_data;
  }

  get id(): string{
    return (this._user_data as TokenData).id;
  }

  isLogged(): boolean{
    return this._token !== "";
  }

  logout(): void{
    this._token = "";
    this._user_data = null;
    localStorage.setItem('user_token', this._token);
    this.router.navigate(['login']);
  }

  getUsers(): Observable<User[]>{
    return this.http.get<User[]>('https://localhost:3000/users', createOptions({}, this.token)).pipe(
      catchError(handleError)
    );
  }
  //todo: add a logout function
}
