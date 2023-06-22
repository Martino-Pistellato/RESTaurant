import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

import { FoodsService, Food, FoodTypes } from '../../services/foods-services/foods.service';
import { OrdersService } from 'src/app/services/orders-services/orders.service';
import { UsersService, RoleTypes } from 'src/app/services/users-services/users.service';
import { SocketService } from 'src/app/services/socket-services/socket.service';
import { Events } from 'src/app/utils';
import { Table } from 'src/app/services/tables-services/tables.service';


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

  @Input() is_mobile: boolean = false;
  @Input() table: Table|null = null;
  @Output() changeModuleEvent = new EventEmitter<string>();

  constructor(private _foodService: FoodsService,
              private _orderService: OrdersService,
              private _userService: UsersService,
              private _socketService: SocketService,
              private _router: Router) { 
    this.role = this._userService.role;
  }

  //Gets all food/drinks on the menu and tells the socket to listen for changes in the menu
  ngOnInit(): void {
    this._foodService.getFoods().subscribe((foods: Food[]) => this.foods = foods);
    this._socketService.listenToServer(Events.UPDATE_FOODS_LIST).subscribe(() => this._foodService.getFoods().subscribe((foods: Food[]) => this.foods = foods));
  }

  //Adds food/drinks to the elements selected for an order
  addFood(food: Food): void{
    this.selectedFoods.push(food);
  }

  //Removes food/drinks to the elements selected for an order
  removeFood(food: Food): void{
    if (!this.selectedFoods.includes(food)) return;
    else this.selectedFoods.splice(this.selectedFoods.indexOf(food),1);
  }

  //Creates order to send to kitchen/bar based on selected elements 
  //(if an order contains both food and drinks, two orders are created and sent to the right users)
  createOrder(){
    let selectedDrinks = this.selectedFoods.filter(food => food.type === FoodTypes.DRINK);
    let selectedFoods = this.selectedFoods.filter(food => food.type !== FoodTypes.DRINK);

    if (selectedDrinks.length > 0)
      this._orderService.createOrder((this.table as Table), selectedDrinks).subscribe(() => {
        if (selectedFoods.length > 0)
          this._orderService.createOrder((this.table as Table), selectedFoods).subscribe(() => this.changePage());
      });
    else if (selectedFoods.length > 0)
      this._orderService.createOrder((this.table as Table), selectedFoods).subscribe(()=> this.changePage());
  }

  //Changes the module exposed in home page
  changePage() {
    this.changeModuleEvent.emit('orders');
  }

  //Used to show/hide ingredients in drop down list when updating a food/drink
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
  
  //Deletes a food/drink from the menu
  deleteFood(food_id:string){
    this._foodService.deleteFood(food_id).subscribe();
  }

  //Creates a new food/drink for the menu
  createFood(){
    this._foodService.addFood(this.name, this.new_food_ingredients, this.price, this.food_type, this.prepare_time).subscribe(() => this.resetField());
  }

  //Updates a food/drink from the menu
  updateFood(food_id:string){
    let index = this.foods.findIndex(food => food._id === food_id);
    this._foodService.updateFood(food_id, this.name, this.foods[index].ingredients, this.price, this.food_type, this.prepare_time).subscribe(() => this.resetField());
  }

  //Resets the fields of the form used to create/update a food/drink
  resetField(){
    this.add_ingredient = '';
    this.remove_ingredient = '';
    this.price = null;
    this.food_type = null;
    this.prepare_time = null;
  }

  //Gets how many times a certain food/drink have been selected for an order
  getNumberOfFoods(food_id: string){
    return this.selectedFoods.filter(food => food._id === food_id).length;
  }
}
