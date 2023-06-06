import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError  } from 'rxjs';
import { Table } from '../tables-services/tables.service';
import { UsersService } from '../users-services/users.service';
import { handleError, createOptions } from 'src/app/utils';

export enum orderStatus {
  RECEIVED,
  PREPARING
}

export interface Order{
  _id:                    string,
  foods_ordered:          string[], 
  beverages_ordered:      string[],

  foods_prepared:         string[],
  beverages_prepared:     string[],

  tables:                 Table[],
  notes:                  string,

  status: {
      foods:              orderStatus,
      beverages:          orderStatus
  },

  insertionDate:          Date
}


@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  constructor(private http: HttpClient, private usersService: UsersService) { }

  getOrders(): Observable<Order[]>{
    return this.http.get<Order[]>('https://localhost:3000/orders',  createOptions({},this.usersService.token)).pipe(
      catchError(handleError)
    );
  }

  createOrder(tables: string[]): Observable<Order>{
    return this.http.post<Order>('https://localhost:3000/orders', {tables: tables}, createOptions({},this.usersService.token)).pipe(
      catchError(handleError)
    );
  }

}
