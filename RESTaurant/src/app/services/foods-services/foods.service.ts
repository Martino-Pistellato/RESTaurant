import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { UsersService } from '../users-services/users.service';
import { handleError, createOptions } from 'src/app/utils';

export enum FoodTypes{
  APPETIZER,
  FIRST_COURSE,
  SECOND_COURSE,
  SIDE_DISH,
  DESSERT,
  DRINK
}

export interface Food{
  _id:            string;
  name:           string;
  price:          number;
  prepare_time:   number; //in minutes
  ingredients:    string[]; 
  type:           FoodTypes;
}


@Injectable({
  providedIn: 'root'
})
export class FoodsService {

  constructor(private http: HttpClient, private usersService: UsersService) { }

  //Gets all food/drinks
  getFoods(): Observable<Food[]>{
    return this.http.get<Food[]>('https://localhost:3000/foods', createOptions({},this.usersService.token)).pipe(
      catchError(handleError)
    );
  }

  //Adds a food/drink to the menu
  addFood(name:string|null, ingredients: string[], price: number|null, type:FoodTypes|null, prepare_time: number|null){
    return this.http.post<Food>('https://localhost:3000/foods', {
      name: name,
      ingredients: ingredients,
      price: price,
      type: type,
      prepare_time: prepare_time
    },  createOptions({},this.usersService.token)).pipe(
      catchError(handleError)
    );
  }

  //Deletes a food/drink from the menu
  deleteFood(food_id: string){
    return this.http.delete('https://localhost:3000/foods/' + food_id,  createOptions({},this.usersService.token)).pipe(
      catchError(handleError)
    );
  }

  //Updates a food/drink on the menu
  updateFood(food_id:string, name:string|null, ingredients: string[], price: number|null, type:FoodTypes|null, prepare_time: number|null){
    return this.http.patch<Food>('https://localhost:3000/foods/' + food_id,{
      name: name,
      ingredients: ingredients,
      price: price,
      type: type,
      prepare_time: prepare_time
    },createOptions({},this.usersService.token)).pipe(
      catchError(handleError)
    );
  }
}
