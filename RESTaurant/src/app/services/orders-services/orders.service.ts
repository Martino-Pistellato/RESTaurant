import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError  } from 'rxjs';
import { Table } from '../tables-services/tables.service';
import { RoleTypes, UsersService } from '../users-services/users.service';
import { handleError, createOptions } from 'src/app/utils';
import { Food } from '../foods-services/foods.service';
import { User } from '../users-services/users.service';

export enum OrderStatus {
  RECEIVED,
  PREPARING,
  TERMINATED
}

export interface Order{
  _id:                    string,
  foods_ordered:          Food[], 
  beverages_ordered:      Food[],

  foods_prepared:         Food[],
  beverages_prepared:     Food[],

  tables:                 Table[],
  notes:                  string,

  status: {
      foods:              OrderStatus,
      beverages:          OrderStatus
  },

  insertionDate:          Date,
  total_queue_time:       number,
  payed:                  boolean,

  cookID:                 User,
  barmanID:               User
}

export interface Receipt {
  date: Date,
  order: string,
  tables: number[],
  foods: {
      name: string,
      price: number
  }[],
  beverages: {
      name: string,
      price: number
  }[],
  covers: number,
  total: number
}

export interface Profit{
  total: number
}


@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  public selectedOrder: string = '';

  constructor(private http: HttpClient, private usersService: UsersService) { }

  updateOrder(foods: Food[], beverages: Food[]): Observable<Order>;
  updateOrder(order: Order): Observable<Order>;

  updateOrder(firstItem: Food[] | Order, secondItem?: Food[]): Observable<Order>{
    if (this.usersService.role === RoleTypes.WAITER)
      return this.http.put<Order>('https://localhost:3000/orders/'+this.selectedOrder, {
        foods: firstItem as Food[],
        beverages: secondItem as Food[],
      }, createOptions({}, this.usersService.token)).pipe(
        catchError(handleError)
      );
    else
      return this.http.put<Order>('https://localhost:3000/orders/'+(firstItem as Order)._id, {}, createOptions({},this.usersService.token)).pipe(
        catchError(handleError)
      );
  }

  getOrders(): Observable<Order[]>{
    return this.http.get<Order[]>('https://localhost:3000/orders',  createOptions({},this.usersService.token)).pipe(
      catchError(handleError)
    );
  }

  createOrder(tables: Table[]): Observable<Order>{
    return this.http.post<Order>('https://localhost:3000/orders', {tables: tables}, createOptions({},this.usersService.token)).pipe(
      catchError(handleError)
    );
  }

  pay(order: Order): Observable<Receipt>{
    return this.http.put<Receipt>('https://localhost:3000/orders/'+order._id, {}, createOptions({},this.usersService.token)).pipe(
      catchError(handleError)
    );
  }

  getTotalProfit(): Observable<Profit>{
    return this.http.get<Profit>('https://localhost:3000/orders/totalprofit',  createOptions({},this.usersService.token)).pipe(
      catchError(handleError)
    );
  }
}
