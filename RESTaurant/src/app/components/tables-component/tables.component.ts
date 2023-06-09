import { Component } from '@angular/core';
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";

import { TablesService, Table } from '../../services/tables-services/tables.service';
import { UsersService, RoleTypes, User } from '../../services/users-services/users.service';
import { Router } from '@angular/router';
import { TableOccupancyDialogComponent } from '../table-occupancy-dialog/table-occupancy-dialog.component';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.css']
})
export class TablesComponent {
  tables: Table[] = [];
  role: RoleTypes | null = null;

  constructor(private tablesService: TablesService, 
              private usersService: UsersService, 
              private router: Router,
              private dialog: MatDialog) { }

  ngOnInit(): void {
    this.role = this.usersService.role;
    if (this.role !== RoleTypes.ADMIN && this.role !== RoleTypes.WAITER && this.role !== RoleTypes.CASHIER)
      this.router.navigate(['home']);
    else 
      this.getAllTables();
  }

  getWaiterName(table: Table): string{
    return (table.waiterId as User).name;
  }

  openDialog(table: Table) {
    if (!table.isFree){
      this.changeStatus(table.number, 0);
      return;
    }
    
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    dialogConfig.data = {
        table: table,
        occupancy: 0
    };

    const dialogRef = this.dialog.open(TableOccupancyDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(
        data => {if(data) this.changeStatus(table.number, data)}
    ); 
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
  
  changeStatus(tableNumber: Number, occupancy: Number): void {
    this.tablesService.changeStatus(tableNumber, occupancy).subscribe({
      next: (table) => {
        this.getAllTables();
      },
      error: (err) => {
        console.log('Error: ' + JSON.stringify(err));
      }
    });
  }

  createTable(capacity: Number, number: Number): void {
    this.tablesService.createTable(capacity, number).subscribe({
      next: (table) => {
        this.getAllTables();
      },
      error: (err) => {
        console.log('Error: ' + JSON.stringify(err));
      }
    });
  }

  deleteTable(tableNumber: Number): void {
    this.tablesService.deleteTable(tableNumber).subscribe({
      next: (table) => {
        this.getAllTables();
      },
      error: (err) => {
        console.log('Error: ' + JSON.stringify(err));
      }
    });
  }

}
