import { Component } from '@angular/core';

import { UsersService, RoleTypes } from '../../services/users-services/users.service';
import { OrdersService } from 'src/app/services/orders-services/orders.service';
import { SocketService } from 'src/app/services/socket-services/socket.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  protected role: RoleTypes | null = null;
  protected profit: number = 0;

  constructor( private userService: UsersService, 
               private orderService: OrdersService,
               private socketService: SocketService) { }

  ngOnInit() {
    this.role = this.userService.role;
    if (this.role === RoleTypes.CASHIER){
      this.updateTotalProfit();
      this.socketService.listenToServer('update_total_profit', (data: any) => this.updateTotalProfit());
    }
  }

  updateTotalProfit(){
    this.orderService.getTotalProfit().subscribe((data) => this.profit = data.total);
  }
}