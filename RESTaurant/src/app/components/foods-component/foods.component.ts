import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FoodsService, Food, FoodTypes } from '../../services/foods-services/foods.service';
import { OrdersService } from 'src/app/services/orders-services/orders.service';
import { UsersService, RoleTypes } from 'src/app/services/users-services/users.service';

@Component({
  selector: 'app-foods',
  templateUrl: './foods.component.html',
  styleUrls: ['./foods.component.css']
})
export class FoodsComponent {
  public foods: Food[] = [];
  public selectedFoods: Food[] = [];
  public selectedBeverages: Food[] = [];
  public role: RoleTypes | null;

  constructor(private _foodService: FoodsService,
              private _orderService: OrdersService,
              private _userService: UsersService,
              private _router: Router) { 
    this.role = this._userService.role;
  }

  ngOnInit(): void {
    if (this._orderService.selectedOrder === '' && this._userService.role !== RoleTypes.ADMIN) 
      this._router.navigate(['home']);
    this._foodService.getFoods().subscribe((foods: Food[]) => this.foods = foods);
  }

  addFood(food: Food): void{
    if (food.type === FoodTypes.DRINK)
      this.selectedBeverages.push(food);
    else
      this.selectedFoods.push(food);
  }

  removeFood(food: Food): void{
    if (food.type === FoodTypes.DRINK){
      if (!this.selectedBeverages.includes(food)) return;
      this.selectedBeverages.splice(this.selectedBeverages.indexOf(food),1);
    }
    else{
      if (!this.selectedFoods.includes(food)) return;
      this.selectedFoods.splice(this.selectedFoods.indexOf(food),1);
    }
  }

  updateOrder(){
    this._orderService.updateOrder(this.selectedFoods, this.selectedBeverages)
    .subscribe((order)=>{this._router.navigate(['home']);});
  }
}
