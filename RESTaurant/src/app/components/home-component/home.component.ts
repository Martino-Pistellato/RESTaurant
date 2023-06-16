import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';

import { UsersService, RoleTypes } from '../../services/users-services/users.service';
import { OrdersService } from 'src/app/services/orders-services/orders.service';
import { SocketService } from 'src/app/services/socket-services/socket.service';
import { Events } from 'src/app/utils';

export const Notifications = {
  NEW_ORDER_RECEIVED: 'A new order has arrived',
  NEW_ORDER_PREPARED: 'A new order has been prepared for table: ',
  USER_LIST_UPDATED:  'The list of users has been updated'
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
  loadedModule?: string;
  order_id: string = '';
  mobile_screen: boolean;
  public innerWidth: any;

  @HostListener('window:resize', ['$event'])
  onResize(event:any) {
    this.innerWidth = event.target.innerWidth;
    this.mobile_screen = this.innerWidth <= 780;
  }

  constructor( protected userService: UsersService, 
               private orderService: OrdersService,
               private socketService: SocketService,
               private router: Router, 
               private snackBar: MatSnackBar,
               private breakpointObserver: BreakpointObserver) {
                if (!this.userService.isLogged()) this.router.navigate(['login']);
                this.innerWidth = window.innerWidth;
                this.mobile_screen = this.innerWidth <= 780;
              }

  ngOnInit() {
    this.name = this.userService.user_data?.name
    this.role = this.userService.role;

    this.socketService.listenToServer(Events.FORCE_LOGOUT).subscribe((user_id: string) => {
      if (this.userService.id === user_id)
        this.openSnackBar('You have been logged out by an admin', 'CLOSE', true);
    });

    if (this.role === RoleTypes.COOK || this.role === RoleTypes.BARMAN)
      this.socketService.listenToServer(Events.NEW_ORDER_RECEIVED).subscribe((role: RoleTypes) => {
        if (role === this.role){
          this.notifications.unshift(Notifications.NEW_ORDER_RECEIVED);
          this.openSnackBar(Notifications.NEW_ORDER_RECEIVED, 'CLOSE', false);
        }
      });
    else if (this.role === RoleTypes.WAITER)
      this.socketService.listenToServer(Events.NEW_ORDER_PREPARED).subscribe((response: any) => {
        if (this.userService.id === response.waiter_id){
          this.notifications.unshift(Notifications.NEW_ORDER_PREPARED+response.table_number)
          this.openSnackBar(Notifications.NEW_ORDER_PREPARED + response.table_number, 'CLOSE', false);
        }
      });
    else if (this.role === RoleTypes.CASHIER || this.role === RoleTypes.ADMIN){
      this.updateTotalProfit();
      this.socketService.listenToServer(Events.UPDATE_TOTAL_PROFIT).subscribe((data: any) => this.updateTotalProfit());
    }
    else if (this.role === RoleTypes.ADMIN){
      this.socketService.listenToServer(Events.UPDATE_USERS_LIST).subscribe((data: any) => {
        this.notifications.unshift(Notifications.USER_LIST_UPDATED)
        this.openSnackBar(Notifications.USER_LIST_UPDATED, 'CLOSE', false);
      });
    }
  }

  addOrder(newOrder: string) {
    this.order_id = newOrder;
    this.loadedModule = 'foods';
  }

  changeModuleEvent(module: string) {
    this.loadedModule = module;
  }

  updateTotalProfit(){
    this.orderService.getTotalProfit().subscribe((data) => this.profit = data.total);
  }

  openSnackBar(message: string, action: string, logout: boolean) {
    this.snackBar.open(message, action,{
      verticalPosition:'top'
    });
    if (logout) this.userService.logout()
  }

  focusOrder(){
    if (this.role === RoleTypes.COOK || this.role === RoleTypes.BARMAN)
      this.loadedModule = 'orders';
    this.notifications.shift();
  }
}