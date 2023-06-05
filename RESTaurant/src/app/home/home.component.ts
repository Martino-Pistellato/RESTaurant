import { Component } from '@angular/core';
import { UsersService, RoleTypes } from '../services/users/users.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  public role: RoleTypes | null = null;

  constructor( private us: UsersService, private router: Router) { }

  ngOnInit() {
    this.role = this.us.role;
  }
}



