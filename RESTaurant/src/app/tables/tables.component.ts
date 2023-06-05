import { Component } from '@angular/core';
import { TablesService, Table } from '../services/tables/tables.service';
import { UsersService, RoleTypes } from '../services/users/users.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.css']
})
export class TablesComponent {
  tables: Table[] = [];
  role: RoleTypes | null = null;

  constructor(private tablesService: TablesService, private usersService: UsersService, private router: Router) { }

  ngOnInit(): void {
    this.role = this.usersService.role;
    if (this.role !== RoleTypes.ADMIN && this.role !== RoleTypes.WAITER && this.role !== RoleTypes.CASHIER)
      this.router.navigate(['home']);
    else 
      this.getAllTables();
  }

  getAllTables(): void {
    this.tablesService.getAllTables().subscribe({
      next: (tables) => {
        this.tables = tables;
      },
      error: (err) => {
        console.log('Error: ' + JSON.stringify(err));
      }
    });
  }
  
  changeStatus(tableNumber: Number): void {
    this.tablesService.changeStatus(tableNumber).subscribe({
      next: (table) => {
        this.getAllTables();
      },
      error: (err) => {
        console.log('Error: ' + JSON.stringify(err));
      }
    });
  }
}
