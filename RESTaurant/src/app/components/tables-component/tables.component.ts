import { Component } from '@angular/core';
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { Router } from '@angular/router';

import { TablesService, Table } from '../../services/tables-services/tables.service';
import { UsersService, RoleTypes, User } from '../../services/users-services/users.service';
import { TableOccupancyDialogComponent } from '../table-occupancy-dialog-component/table-occupancy-dialog.component';
import { SocketService } from 'src/app/services/socket-services/socket.service';
import { Events } from 'src/app/utils';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.css']
})
export class TablesComponent {
  protected tables: Table[] = [];
  protected role: RoleTypes;
  protected table_number: number | null = null;
  protected table_capacity: number | null = null;

  constructor(private tablesService: TablesService, private usersService: UsersService, 
              private socketService: SocketService, private router: Router,
              private dialog: MatDialog) {
    this.role = this.usersService.role;
    if (this.role !== RoleTypes.ADMIN && this.role !== RoleTypes.WAITER && this.role !== RoleTypes.CASHIER)
      this.router.navigate(['home']);
  }

  ngOnInit(): void {
    this.getTables();
    this.socketService.listenToServer(Events.UPDATE_TABLES_LIST).subscribe((data: any) => this.getTables());
  }

  getWaiterName(table: Table): string{
    return (table.waiter_id as User).name;
  }

  openDialog(table: Table) {
    if (!table.is_free){
      this.changeStatus(table._id, 0);
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
      data => { if (data) { this.changeStatus(table._id, data) } } 
    ); 
  }

  getTables(): void {
    this.tablesService.getTables().subscribe({
      next: (tables) => this.tables = tables,
      error: (err) => console.log('Error: ' + JSON.stringify(err))
    });
  }
  
  changeStatus(table_id: string, occupancy: number): void {
    this.tablesService.changeStatus(table_id, (this.role === RoleTypes.WAITER)? this.usersService.id : null, occupancy).subscribe();
  }

  createTable(table_capacity: number | null, table_number: number | null): void {
    this.tablesService.createTable(table_capacity, table_number).subscribe(() => this.resetField());
  }

  updateTable(table_id: string, table_capacity: number | null, table_number: number | null): void {
    this.tablesService.updateTable(table_id, table_capacity, table_number).subscribe(() => this.resetField());
  }

  deleteTable(table_id: string): void {
    this.tablesService.deleteTable(table_id).subscribe();
  }

  resetField(){
    this.table_capacity = null;
    this.table_number = null;
  }
}
