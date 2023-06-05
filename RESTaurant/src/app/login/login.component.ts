import { Component } from '@angular/core';
import { UsersService, RoleTypes } from '../services/users/users.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  public errmessage: string | undefined = undefined;
  public role: RoleTypes | null = null;

  constructor( private us: UsersService, private router: Router  ) { }

  ngOnInit() {
    this.role = this.us.role;
  }

  login(mail: string, password: string) {
    this.us.login(mail, password).subscribe({
      next: (d) => {
        console.log('Login granted: ' + JSON.stringify(d));
        this.errmessage = undefined;
        this.router.navigate(['home']);
      },
      error: (err) => {
        console.log('Login error: ' + JSON.stringify(err));
        
        if(err.status === 401)
          this.errmessage = "Invalid credentials";
        else if(err.status === 500)
          this.errmessage = "Server error";
        else
          this.errmessage = err.message;
      }
    });

  }
}