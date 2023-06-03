import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import jwt_decode from "jwt-decode";

export enum roleTypes{
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
  role:   roleTypes,
  email:  string,
  id :    string
};

export interface User{
  name:       string,  
  role:       roleTypes,
  email:      string,
  id :        string,
  password:   string
};

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private token: string;
  private user_data: TokenData | null;

  constructor(private http: HttpClient) { 
    const loadedtoken = localStorage.getItem('user_token');

    if ( !loadedtoken || loadedtoken.length < 1 ) {
      console.log("No token found in local storage");
      this.token = "";
      this.user_data = null;
    } else {
      this.token = loadedtoken as string;
      this.user_data = jwt_decode<TokenData>(this.token);
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
        this.token = (data as Token).token;
        this.user_data = jwt_decode<TokenData>(this.token);
        //localStorage.setItem('user_token', this.token);
      })
    );
  }

  //todo: add a logout function
}
