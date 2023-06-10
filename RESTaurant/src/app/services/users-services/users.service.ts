import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, throwError, catchError  } from 'rxjs';
import jwt_decode from "jwt-decode";

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
  name:       string,  
  role:       RoleTypes,
  email:      string,
  _id:        string,
  password:   string,
  totalWorks: string[]
};

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private _token: string;
  private _user_data: TokenData | null;

  constructor(private http: HttpClient) { 
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

  get role(): RoleTypes | null{
    if(this._user_data)
      return this._user_data.role;
    else
      return null;
  }

  get token() : string{
    return this._token;
  }

  get user_data() : TokenData | null{
    return this._user_data;
  }
  //todo: add a logout function
}
