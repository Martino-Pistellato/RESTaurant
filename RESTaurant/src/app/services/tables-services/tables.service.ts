import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError  } from 'rxjs';
import { handleError, createOptions } from 'src/app/utils';
import { UsersService, User } from '../users-services/users.service';

export interface Table{
  _id:            string,
  number:         number,
  capacity:       number,
  is_free:        boolean,
  waiter_id:      string | null | User,
  occupancy:      number,
  linked_tables:  Table[]
}

@Injectable({
  providedIn: 'root'
})
export class TablesService {

  constructor(private http: HttpClient, private usersService: UsersService) { }

  //Gets all tables
  getTables(): Observable<Table[]>{
    return this.http.get<Table[]>('https://localhost:3000/tables', createOptions({},this.usersService.token)).pipe(
      catchError(handleError)
    );
  }

  //Gets a table
  getTable(table_id: string): Observable<Table>{
    return this.http.get<Table>('https://localhost:3000/tables/'+table_id, createOptions({table_id: table_id},this.usersService.token)).pipe(
      catchError(handleError)
    );
  }

  //Gets all tables served by a certain waiter
  getServingTables(): Observable<Table[]>{
    return this.http.get<Table[]>('https://localhost:3000/tables/serving', createOptions({},this.usersService.token)).pipe(
      catchError(handleError)
    );
  }

  //Changes table's status (FREE <--> OCCUPIED)
  changeStatus(table_id: string, id: string | null, occupancy: number): Observable<Table>{
    return this.http.put<Table>('https://localhost:3000/tables',{
      table_id: table_id,
      id: id,
      occupancy: occupancy
    },createOptions({},this.usersService.token)).pipe(
      catchError(handleError)
    );
  }

  //Updates the table's filed "linked_tables"
  linkTables(tables: Table[]){
    return this.http.put<Table>('https://localhost:3000/tables/link',{
      tables: tables
    },createOptions({},this.usersService.token)).pipe(
      catchError(handleError)
    );
  }

  //Creates a new table
  createTable(table_capacity: number | null, table_number: number | null): Observable<Table>{
    return this.http.post<Table>('https://localhost:3000/tables',{
      table_capacity: table_capacity,
      table_number: table_number
    },createOptions({},this.usersService.token)).pipe(
      catchError(handleError)
    );
  }

  //Updates a table
  updateTable(table_id: string, table_capacity: number | null, table_number: number | null): Observable<Table>{
    return this.http.patch<Table>('https://localhost:3000/tables/'+table_id,{
      table_capacity: table_capacity,
      table_number: table_number
    },createOptions({},this.usersService.token)).pipe(
      catchError(handleError)
    );
  }

  //Deletes a table
  deleteTable(table_id: string){
    return this.http.delete('https://localhost:3000/tables/'+table_id,createOptions({},this.usersService.token)).pipe(
      catchError(handleError)
    );
  }
}
