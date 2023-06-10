import { Component } from '@angular/core';
import { UsersService, RoleTypes } from '../../services/users-services/users.service';
import { Order, OrdersService } from 'src/app/services/orders-services/orders.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  protected role: RoleTypes | null = null;
  protected profit: number = 0;

  constructor( private userService: UsersService, private router: Router, private orderService: OrdersService) { }

  ngOnInit() {
    this.role = this.userService.role;
    if (this.role === RoleTypes.CASHIER)
      this.orderService.getTotalProfit().subscribe((data) => this.profit = data.total);
  }
}



