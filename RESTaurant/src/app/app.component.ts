import { Component } from '@angular/core';
import { UsersService } from './services/users-services/users.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'RESTaurant';
  opened = false;
  constructor(protected usersService: UsersService, private router: Router){}

  navigate(route: string){
    let name;
    switch (route){
      case 'home': name = ' - Home'; break;
      case 'login': name = ''; break;
      case 'tables': name = ' - Tables'; break;
      case 'orders': name = ' - Orders'; break;
      case 'users': name = ' - Users'; break;
      case 'foods': name = ' - Foods'; break;
      case 'stats': name = ' - Statistics'; break;
    }
    this.title = 'RESTaurant' + name;
    this.router.navigate([route]);
  }
}
