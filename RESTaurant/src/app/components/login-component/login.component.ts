import { Component } from '@angular/core';
import { UsersService, RoleTypes } from '../../services/users-services/users.service';
import { Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  public errmessage: string | undefined = undefined;
  //public role: RoleTypes | null = null;
  protected email:string = '';
  protected password: string = '';
  public emailControl: FormControl;
  public passwordControl: FormControl;

  getEmailErrorMessage() {
    return  this.emailControl.hasError('required') ? 'Email must be provided' : 
            this.emailControl.hasError('email') ? 'An email shoud have one @' : 
            'Unknown error';
  }

  getPasswordErrorMessage() {
    return  this.passwordControl.hasError('required') ? 'Password must be provided' : 
            this.passwordControl.hasError('minlength') ? 'Password must be at least 6 characters long' : 
            'Unknown error';
  }

  constructor( private us: UsersService, private router: Router  ) { 
    this.emailControl = new FormControl('', [Validators.required, Validators.email]);
    this.passwordControl = new FormControl('', [Validators.required, Validators.minLength(6)]);
  }

  ngOnInit() {
    //this.role = this.us.role;
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