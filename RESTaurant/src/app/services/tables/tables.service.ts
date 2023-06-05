import { Injectable } from '@angular/core';
import { UsersService } from '../users/users.service';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, throwError, catchError  } from 'rxjs';
import jwt_decode from "jwt-decode";

export interface Table{
  number: number,
  capacity: number,
  isFree: boolean,
  waiterId: string | null,
  occupancy: number
}

@Injectable({
  providedIn: 'root'
})
export class TablesService {
  constructor(private http: HttpClient, private usersService: UsersService) { }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
      return throwError(() => error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` +
        'body was: ' + JSON.stringify(error.error));

      return throwError(() => error.error.errormessage);
    }
  }

  private create_options( passed_params = {} ) { //alfredo@waiter.RESTaurant.it
    return  {
      headers: new HttpHeaders({
        authorization: 'Bearer ' + this.usersService.token,
        'cache-control': 'no-cache',
        'Content-Type':  'application/json',
      }),
      params: new HttpParams().appendAll( passed_params )
    };
  }

  getMyTables(): Observable<Table[]>{
    return this.http.get<Table[]>('https://localhost:3000/tables',  this.create_options()).pipe(
      catchError(this.handleError)
    );
  }


  getAllTables(): Observable<Table[]>{
    return this.http.get<Table[]>('https://localhost:3000/tables/all',  this.create_options()).pipe(
      catchError(this.handleError)
    );
  }

  changeStatus(tableNumber: Number): Observable<Table>{
    return this.http.put<Table>('https://localhost:3000/tables',{
      tableNumber: tableNumber,
      occupancy: 1
    }, this.create_options())
    .pipe(
      catchError(this.handleError)
    );
  }
}
