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
  _id:             string;
  name:           string;
  price:          number;
  prepareTime:    number; //in minutes
  ingredients:    string[]; 
  type:           FoodTypes;
}


@Injectable({
  providedIn: 'root'
})
export class FoodsService {

  constructor(private http:HttpClient, private usersService: UsersService) { }

  getFoods(): Observable<Food[]>{
    return this.http.get<Food[]>('https://localhost:3000/foods', createOptions({},this.usersService.token)).pipe(
      catchError(handleError)
    );
  }

  addFood(food: Food){
    return this.http.post('https://localhost:3000/foods', food,  createOptions({},this.usersService.token)).pipe(
      catchError(handleError)
    );
  }

  deleteFood(foodID: string){
    return this.http.delete('https://localhost:3000/foods/' + foodID,  createOptions({},this.usersService.token)).pipe(
      catchError(handleError)
    );
  }
}
