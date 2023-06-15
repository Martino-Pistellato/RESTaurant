import { HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

export function handleError(error: HttpErrorResponse) {
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

export function createOptions( passed_params = {}, token:string ) { 
  return  {
      headers: new HttpHeaders({
          authorization: 'Bearer ' + token,
          'cache-control': 'no-cache',
          'Content-Type':  'application/json',
      }),
      params: new HttpParams().appendAll( passed_params )
  };
}

export const Events = {
  UPDATE_TABLES_LIST:     'update_tables_list',
  UPDATE_ORDERS_LIST:     'update_orders_list',
  UPDATE_USERS_LIST:      'update_total_profit',
  UPDATE_TOTAL_PROFIT:    'update_total_profit',

  NEW_ORDER_RECEIVED:     'new_order_received',
  NEW_ORDER_PREPARED:     'new_order_prepared'
}