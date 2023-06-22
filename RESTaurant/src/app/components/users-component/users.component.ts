import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';

import { SocketService } from 'src/app/services/socket-services/socket.service';
import { UsersService, RoleTypes, User } from 'src/app/services/users-services/users.service';
import { Events } from 'src/app/utils';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent {
  protected users: User[] = [];

  protected role: RoleTypes | null = null;
  protected password: string | null = null;
  protected email: string | null = null;
  protected name: string | null = null;
  
  protected hide = true;
  protected emailControl: FormControl;
  protected passwordControl: FormControl;
  protected nameControl: FormControl;
  protected roleControl: FormControl;

  @Input() is_mobile: boolean = false;

  constructor(private socketService: SocketService, 
              private usersService: UsersService,
              private router: Router){
                this.emailControl = new FormControl('', [Validators.required, Validators.email]);
                this.passwordControl = new FormControl('', [Validators.required, Validators.minLength(6)]);
                this.nameControl = new FormControl('', [Validators.required]);
                this.roleControl = new FormControl('', [Validators.required]);
              }

  //Gets a list of users and tells the server to listen for changes in the user list
  ngOnInit(){
    this.getUsers();
    this.socketService.listenToServer(Events.UPDATE_USERS_LIST).subscribe(() => this.getUsers());
  }

  //Gets all users
  getUsers(){
    this.resetField();
    this.usersService.getUsers().subscribe(users => this.users = users.filter(user => user.role !== RoleTypes.ADMIN));
  }

  //Updates a user
  updateUser(user_id: string, name: string | null, email: string | null, role: number | null, password: string | null){
    this.usersService.updateUser(user_id, name, email, role, password).subscribe();
  }

  //Deletes a user
  deleteUser(user_id: string){
    this.usersService.deleteUser(user_id).subscribe( );
  }

  //Creates a user
  createUser(name: string | null, email: string | null, role: RoleTypes | null, password: string | null){
    this.usersService.createUser(name, email, role, password).subscribe(user => this.resetField())
  }

  //Resets form fields after creating/updating a user
  resetField(){
    this.role = null;
    this.name = null;
    this.email = null;
    this.password = null;
  }

  //Checks if email in form field respects constraints
  getEmailErrorMessage() {
    return  this.emailControl.hasError('required') ? 'Email must be provided' : 
            this.emailControl.hasError('email') ? 'An email shoud have one @' : 
            'Unknown error';
  }

  //Checks if password in form field respects constraints
  getPasswordErrorMessage() {
    return  this.passwordControl.hasError('required') ? 'Password must be provided' : 
            this.passwordControl.hasError('minlength') ? 'Password must be at least 6 characters long' : 
            'Unknown error';
  }

  //Checks if name in form field respects constraints
  getNameErrorMessage() {
    return  this.nameControl.hasError('required') ? 'Name must be provided' : 'Unknown error';
  }

  //Checks if role in form field respects constraints
  getRoleErrorMessage() {
    return  this.roleControl.hasError('required') ? 'Role must be provided' : 'Unknown error';
  }
}
