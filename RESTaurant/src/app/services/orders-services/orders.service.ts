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
  _id:            string,
  foods:          Food[],
  cook_id:        User,

  table:          Table,
  notes:          string,

  status:         OrderStatus,
  is_payed:       boolean,
  covers:         number,

  insertion_date: Date,
  queue_time:     number
}

export interface Receipt {
  date:       Date,
  order:      string,
  tables:     number[],
  foods: {
      name:   string,
      price:  number
  }[],
  drinks: {
      name:   string,
      price:  number
  }[],
  covers:     number,
  total:      number
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

  updateOrder(firstItem: Food[] | Order | string): Observable<Order>{
    if (this.usersService.role === RoleTypes.WAITER)
      return this.http.put<Order>('https://localhost:3000/orders', {
        order_id: this.selectedOrder,
        foods: firstItem as Food[],
      }, createOptions({}, this.usersService.token)).pipe(
        catchError(handleError)
      );
    else if (this.usersService.role === RoleTypes.COOK || this.usersService.role === RoleTypes.BARMAN){
      return this.http.put<Order>('https://localhost:3000/orders', {
        order_id: (firstItem as Order)._id
      }, createOptions({},this.usersService.token)).pipe(
        catchError(handleError)
      );}
    else{
      return this.http.put<Order>('https://localhost:3000/orders', {
        order_id: (firstItem as string)
      }, createOptions({},this.usersService.token)).pipe(
        catchError(handleError)
      );}
  }

  getOrders(): Observable<Order[]>{
    return this.http.get<Order[]>('https://localhost:3000/orders',  createOptions({},this.usersService.token)).pipe(
      catchError(handleError)
    );
  }

  getAllOrders(): Observable<Order[]>{
    return this.http.get<Order[]>('https://localhost:3000/orders/all',  createOptions({},this.usersService.token)).pipe(
      catchError(handleError)
    );
  }

  createOrder(table: Table): Observable<Order>{
    return this.http.post<Order>('https://localhost:3000/orders', {table: table}, createOptions({},this.usersService.token)).pipe(
      catchError(handleError)
    );
  }

  getReceipt(table: Table): Observable<Receipt>{
    return this.http.get<Receipt>('https://localhost:3000/orders/receipt/'+table._id, createOptions({
      table_id: table._id
    },this.usersService.token)).pipe(
      catchError(handleError)
    );
  }

  getTotalProfit(): Observable<Profit>{
    return this.http.get<Profit>('https://localhost:3000/orders/totalprofit',  createOptions({},this.usersService.token)).pipe(
      catchError(handleError)
    );
  }

  deleteOrder(order_id: string){
    return this.http.delete('https://localhost:3000/orders/'+order_id,  createOptions({},this.usersService.token)).pipe(
      catchError(handleError)
    );
  }
}
