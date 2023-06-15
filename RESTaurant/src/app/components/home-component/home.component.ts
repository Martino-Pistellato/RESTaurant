import { Component } from '@angular/core';

import { UsersService, RoleTypes } from '../../services/users-services/users.service';
import { OrdersService } from 'src/app/services/orders-services/orders.service';
import { SocketService } from 'src/app/services/socket-services/socket.service';
import { Events } from 'src/app/utils';

export const Notifications = {
  NEW_ORDER_RECEIVED: 'A new order has arrived',
  NEW_ORDER_PREPARED: 'A new order has been prepared for table: '
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  protected role: RoleTypes | null = null;
  protected profit: number = 0;
  protected name: string | undefined = '';
  protected notifications: string[] = [];

  constructor( private userService: UsersService, 
               private orderService: OrdersService,
               private socketService: SocketService) { }

  ngOnInit() {
    this.role = this.userService.role;
    this.name = this.userService.user_data?.name

    if (this.role === RoleTypes.CASHIER){
      this.updateTotalProfit();
      this.socketService.listenToServer(Events.UPDATE_TOTAL_PROFIT, (data: any) => this.updateTotalProfit());
    }
    else if (this.role === RoleTypes.COOK || this.role === RoleTypes.BARMAN)
      this.socketService.listenToServer(Events.NEW_ORDER_RECEIVED, (role: RoleTypes) => {
        if (role === this.role)
          this.notifications.unshift(Notifications.NEW_ORDER_RECEIVED);
      });
    else if (this.role === RoleTypes.WAITER)
      this.socketService.listenToServer(Events.NEW_ORDER_PREPARED, (waiter_id: string, table_number: number) => {
        if (this.userService.id === waiter_id)
          this.notifications.unshift(Notifications.NEW_ORDER_PREPARED+table_number);
      });
  }

  updateTotalProfit(){
    this.orderService.getTotalProfit().subscribe((data) => this.profit = data.total);
  }
}