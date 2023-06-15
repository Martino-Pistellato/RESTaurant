import { Component } from '@angular/core';

import { UsersService, RoleTypes } from '../../services/users-services/users.service';
import { OrdersService } from 'src/app/services/orders-services/orders.service';
import { SocketService } from 'src/app/services/socket-services/socket.service';
import {  } from 'src/app/app.component';
export interface Tile {
  color: string;
  cols: number;
  rows: number;
  text: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  protected role: RoleTypes | null = null;
  protected profit: number = 0;
  protected name: string | undefined = ''

  tiles: Tile[] = [
    {text: 'NAME', cols: 3, rows: 1, color: 'lightblue'},
    {text: 'ROLE', cols: 1, rows: 1, color: 'lightgreen'},
    {text: 'ACTIONS', cols: 3, rows: 2, color: 'lightgreen'},
    {text: 'NOTIFICATIONS', cols: 1, rows: 2, color: 'lightpink'},
  ];

  constructor( private userService: UsersService, 
               private orderService: OrdersService,
               private socketService: SocketService) { }

  ngOnInit() {
    this.role = this.userService.role;
    this.name = this.userService.user_data?.name
    if (this.role === RoleTypes.CASHIER){
      this.updateTotalProfit();
      this.socketService.listenToServer('update_total_profit', (data: any) => this.updateTotalProfit());
    }
  }

  updateTotalProfit(){
    this.orderService.getTotalProfit().subscribe((data) => this.profit = data.total);
  }
}