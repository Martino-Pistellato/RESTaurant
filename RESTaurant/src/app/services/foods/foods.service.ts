import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Observable} from 'rxjs';

export enum foodTypes{
  APPETIZER,
  FIRST_COURSE,
  SECOND_COURSE,
  SIDE_DISH,
  DESSERT,
  DRINK
}

export interface Food{
  id:             string;
  name:           string;
  price:          number;
  prepareTime:    number; //in minutes
  ingredients:    string[]; 
  type:           foodTypes;
}


@Injectable({
  providedIn: 'root'
})
export class FoodsService {

  constructor(private http:HttpClient) { }

  getFoods(): Observable<Food[]>{
    //how do cookies work? is it already sent with the request?
    return this.http.get<Food[]>('/foods');
  }

  addFood(food: Food){
    return this.http.post('/foods', food);
  }

  deleteFood(foodID: string){
    return this.http.delete('/foods/' + foodID);
  }
}
