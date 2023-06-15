import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UsersService, RoleTypes } from './services/users-services/users.service';
import { SocketService } from './services/socket-services/socket.service';
import { Events } from './utils';

export const Notifications = {
  NEW_ORDER_RECEIVED: 'A new order has arrived',
  NEW_ORDER_PREPARED: 'A new order has been prepared for table: '
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'RESTaurant';
  opened = false;
  role;
  constructor(protected usersService: UsersService, 
              private socketService: SocketService, 
              private router: Router, 
              private snackBar: MatSnackBar){
    this.role = this.usersService.role;
    if (this.role === RoleTypes.COOK || this.role === RoleTypes.BARMAN)
      this.socketService.listenToServer(Events.NEW_ORDER_RECEIVED, (role: RoleTypes) => {
        if (role === this.role)
          this.openSnackBar(Notifications.NEW_ORDER_RECEIVED, 'CLOSE');
      });
    else if (this.role === RoleTypes.WAITER)
      this.socketService.listenToServer(Events.NEW_ORDER_PREPARED, (waiter_id: string, table_number: number) => {
        if (this.usersService.id === waiter_id)
          this.openSnackBar(Notifications.NEW_ORDER_PREPARED + table_number, 'CLOSE');
      });
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action,{
      verticalPosition:'top'
    });
  }
}
