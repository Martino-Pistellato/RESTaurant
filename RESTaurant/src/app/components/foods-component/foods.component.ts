import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

import { FoodsService, Food } from '../../services/foods-services/foods.service';
import { OrdersService } from 'src/app/services/orders-services/orders.service';
import { UsersService, RoleTypes } from 'src/app/services/users-services/users.service';
import { SocketService } from 'src/app/services/socket-services/socket.service';

@Component({
  selector: 'app-foods',
  templateUrl: './foods.component.html',
  styleUrls: ['./foods.component.css']
})
export class FoodsComponent {
  public foods: Food[] = [];
  public selectedFoods: Food[] = [];
  public role: RoleTypes;
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
    if (this._orderService.selectedOrder === '' && this._userService.role !== RoleTypes.ADMIN) 
      this._router.navigate(['home']);
    console.log("try to fill order: ",this._orderService.selectedOrder)
    this._foodService.getFoods().subscribe((foods: Food[]) => this.foods = foods);
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
}
