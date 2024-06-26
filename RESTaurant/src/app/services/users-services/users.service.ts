import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, throwError, catchError  } from 'rxjs';
import jwt_decode from "jwt-decode";
import { createOptions, handleError } from 'src/app/utils';
import { SocketService } from '../socket-services/socket.service';

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
  id:     string
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

  constructor(private http: HttpClient, private router: Router, private socketService: SocketService) { 
    const loadedtoken = localStorage.getItem('user_token');

    //Gets user JWT if already saved in browser
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

  //Handles login phase. If successful, a JWT is stored in the client browser
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

  //Gets user's role
  get role(): RoleTypes{
    return (this._user_data as TokenData).role;
  }

  //Gets user's token
  get token(): string{
    return this._token;
  }

  //Gets user's data (name, email, role, id)
  get user_data(): TokenData | null{
    return this._user_data;
  }

  //Gets user's id
  get id(): string{
    return (this._user_data as TokenData).id;
  }

  //Checks if user is logged in
  isLogged(): boolean{
    return this._token !== "";
  }

  //Performs a logout
  logout(): void{
    this._token = "";
    this._user_data = null;
    localStorage.setItem('user_token', this._token);
    this.socketService.disconnect();
    this.router.navigate(['login']);
  }

  //Gets all users
  getUsers(): Observable<User[]>{
    return this.http.get<User[]>('https://localhost:3000/users', createOptions({}, this.token)).pipe(
      catchError(handleError)
    );
  }

  //Deletes a user
  deleteUser(user_id: string){
    return this.http.delete('https://localhost:3000/users/'+user_id, createOptions({}, this.token)).pipe(
      catchError(handleError)
    );
  }

  //Updates a user
  updateUser(user_id: string, name: string | null, email: string | null, role: number | null, password: string | null): Observable<User>{
    return this.http.put<User>('https://localhost:3000/users/'+user_id,{
      name: name,
      email: email,
      role: role,
      password: password
    },createOptions({}, this.token)).pipe(
      catchError(handleError)
    );
  }

  //Creates a new user
  createUser(name: string | null, email: string | null, role: RoleTypes | null, password: string | null): Observable<User>{
    return this.http.post<User>('https://localhost:3000/users',{
      name: name,
      email: email,
      role: role,
      password: password
    },createOptions({}, this.token)).pipe(
      catchError(handleError)
    );
  }
}
