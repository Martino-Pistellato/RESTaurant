import { Component } from '@angular/core';
import { Router } from '@angular/router';
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
  protected hide = true;
  protected password: string | null = null;
  protected email: string | null = null;
  protected name: string | null = null;

  constructor(private socketService: SocketService, 
              private usersService: UsersService,
              private router: Router){
                if (this.usersService.role !== RoleTypes.ADMIN)
                  this.router.navigate(['home']);
              }

  ngOnInit(){
    this.getUsers();
    this.socketService.listenToServer(Events.UPDATE_USERS_LIST, () => this.getUsers());
  }

  getUsers(){
    this.resetField();
    this.usersService.getUsers().subscribe(users => this.users = users.filter(user => user.role !== RoleTypes.ADMIN));
  }

  updateUser(user_id: string, name: string | null, email: string | null, role: number | null, password: string | null){
    this.usersService.updateUser(user_id, name, email, role, password).subscribe();
  }

  deleteUser(user_id: string){
    this.usersService.deleteUser(user_id).subscribe(() =>
      console.log("deleteed")
      );
  }

  resetField(){
    this.role = null;
    this.name = null;
    this.email = null;
    this.password = null;
  }
}
