import { HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { throwError} from 'rxjs';

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

export function createOptions( passed_params = {}, token:string ) { //alfredo@waiter.RESTaurant.it
    return  {
        headers: new HttpHeaders({
            authorization: 'Bearer ' + token,
            'cache-control': 'no-cache',
            'Content-Type':  'application/json',
        }),
        params: new HttpParams().appendAll( passed_params )
    };
}