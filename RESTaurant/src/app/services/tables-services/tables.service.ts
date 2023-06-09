import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError  } from 'rxjs';
import { handleError, createOptions } from 'src/app/utils';
import { UsersService, User } from '../users-services/users.service';

export interface Table{
  _id:        string,
  number:     number,
  capacity:   number,
  isFree:     boolean,
  waiterId:   string | null | User,
  occupancy:  number
}



@Injectable({
  providedIn: 'root'
})
export class TablesService {
  constructor(private http: HttpClient, private usersService: UsersService) { }

  getMyTables(): Observable<Table[]>{
    return this.http.get<Table[]>('https://localhost:3000/tables',  createOptions({},this.usersService.token)).pipe(
      catchError(handleError)
    );
  }

  getAllTables(): Observable<Table[]>{
    return this.http.get<Table[]>('https://localhost:3000/tables/all',  createOptions({},this.usersService.token)).pipe(
      catchError(handleError)
    );
  }

  changeStatus(tableNumber: Number, occupancy: Number): Observable<Table>{
    return this.http.put<Table>('https://localhost:3000/tables',{
      tableNumber: tableNumber,
      occupancy: occupancy
    }, createOptions({},this.usersService.token))
    .pipe( catchError(handleError) );
  }

  createTable(capacity: Number, number: Number): Observable<Table>{
    return this.http.post<Table>('https://localhost:3000/tables', {
      capacity: capacity,
      number: number
    }, createOptions({},this.usersService.token))
    .pipe( catchError(handleError) );
  }

  deleteTable(tableNumber: Number): Observable<Table>{
    return this.http.delete<Table>('https://localhost:3000/tables/' + tableNumber, createOptions({},this.usersService.token))
    .pipe( catchError(handleError) );
  }
}
