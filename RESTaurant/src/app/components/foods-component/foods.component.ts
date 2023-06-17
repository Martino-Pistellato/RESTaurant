import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

import { FoodsService, Food, FoodTypes } from '../../services/foods-services/foods.service';
import { OrdersService } from 'src/app/services/orders-services/orders.service';
import { UsersService, RoleTypes } from 'src/app/services/users-services/users.service';
import { SocketService } from 'src/app/services/socket-services/socket.service';
import { Events } from 'src/app/utils';

@Component({
  selector: 'app-foods',
  templateUrl: './foods.component.html',
  styleUrls: ['./foods.component.css']
})
export class FoodsComponent {
  public foods: Food[] = [];
  public selectedFoods: Food[] = [];
  public role: RoleTypes;
  add_ingredient:string = '';
  remove_ingredient:string = '';
  food_type: FoodTypes | null = null;
  price: number | null = null;
  prepare_time: number | null = null;
  name: string|null = null;
  new_food_ingredients: string[] = [];

  @Input() order_id: string = '';
  @Output() changeModuleEvent = new EventEmitter<string>();

  constructor(private _foodService: FoodsService,
              private _orderService: OrdersService,
              private _userService: UsersService,
              private _socketService: SocketService,
              private _router: Router) { 
    this.role = this._userService.role;
  }

  ngOnInit(): void {
    this._foodService.getFoods().subscribe((foods: Food[]) => this.foods = foods);
    this._socketService.listenToServer(Events.UPDATE_FOODS_LIST).subscribe(() => this._foodService.getFoods().subscribe((foods: Food[]) => this.foods = foods));
  }

  addFood(food: Food): void{
    this.selectedFoods.push(food);
  }

  removeFood(food: Food): void{
    if (!this.selectedFoods.includes(food)) return;
    else this.selectedFoods.splice(this.selectedFoods.indexOf(food),1);
  }

  updateOrder(){
    this._orderService.updateOrder(this.selectedFoods)
    .subscribe(()=> this.addNewOrder() );
  }

  addNewOrder() {
    this.changeModuleEvent.emit('orders');
  }

  toggleIngredient(ingredient: string, food_id: string|null){
    if (food_id !== null){
      let index = this.foods.findIndex(food => food._id === food_id);

      if (!this.foods[index].ingredients.includes(ingredient))
        this.foods[index].ingredients.push(ingredient);
      else 
        this.foods[index].ingredients.splice(this.foods[index].ingredients.indexOf(ingredient),1);
    }
    else {
      if (!this.new_food_ingredients.includes(ingredient))
        this.new_food_ingredients.push(ingredient);
      else 
        this.new_food_ingredients.splice(this.new_food_ingredients.indexOf(ingredient),1);
    }
  }
  
  deleteFood(food_id:string){
    this._foodService.deleteFood(food_id).subscribe();
  }

  createFood(){
    this._foodService.addFood(this.name, this.new_food_ingredients, this.price, this.food_type, this.prepare_time).subscribe(() => this.resetField());
  }

  updateFood(food_id:string){
    let index = this.foods.findIndex(food => food._id === food_id);
    this._foodService.updateFood(food_id, this.name, this.foods[index].ingredients, this.price, this.food_type, this.prepare_time).subscribe(() => this.resetField());
  }

  resetField(){
    this.add_ingredient = '';
    this.remove_ingredient = '';
    this.price = null;
    this.food_type = null;
    this.prepare_time = null;
  }

  getNumberOfFoods(food_id: string){
    return this.selectedFoods.filter(food => food._id === food_id).length;
  }
}
