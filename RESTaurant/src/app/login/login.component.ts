import { Component } from '@angular/core';
import { UsersService } from '../services/users/users.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  public errmessage = undefined;
  
  constructor( private us: UsersService, private router: Router  ) { }

  ngOnInit() {
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
        this.errmessage = err.message;

      }
    });

  }
}