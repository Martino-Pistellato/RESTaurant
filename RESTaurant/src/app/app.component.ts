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
  //role;
  constructor(protected usersService: UsersService, 
              private socketService: SocketService, 
              private router: Router, 
              private snackBar: MatSnackBar){
    
  }

  
}
