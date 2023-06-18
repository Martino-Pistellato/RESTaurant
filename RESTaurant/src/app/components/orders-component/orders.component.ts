import { Component, Output, EventEmitter, Input  } from '@angular/core';
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { MatSnackBar } from '@angular/material/snack-bar';

import { ReceiptDialogComponent } from '../receipt-dialog-component/receipt-dialog.component';
import { TablesService, Table } from 'src/app/services/tables-services/tables.service';
import { OrdersService, Order, OrderStatus, Receipt } from 'src/app/services/orders-services/orders.service';
import { UsersService, RoleTypes } from 'src/app/services/users-services/users.service';
import { SocketService } from 'src/app/services/socket-services/socket.service';
import { Events } from 'src/app/utils';

interface Group{
  orders: Order[],
  table_numbers: number[],
  main_table: Table
}

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent {
  private myTables: Table[] = [];
  private myOrders: Order[] = [];
  protected role: RoleTypes;

  protected tablesWithOrders: Table[][] = [];
  protected tablesWithoutOrders: Table[] = [];
  protected selectedTables: Table[] = [];
  protected show_selected_tables: string = '';

  private receivedOrders: Order[] = [];
  private preparingOrders: Order[] = [];
  private terminatedOrders: Order[] = [];

  protected receivedGroups: Group[] = [];
  protected preparingGroups: Group[] = [];
  protected terminatedGroups: Group[] = [];

  @Input()  is_mobile: boolean = false;
  @Output() newOrderEvent = new EventEmitter<Table>();
  
  constructor(private tablesService: TablesService, 
              private ordersService: OrdersService,
              private usersService: UsersService, 
              private socketService: SocketService, 
              private snackBar: MatSnackBar,
              private dialog: MatDialog) {
    this.role = this.usersService.role;
  }

  ngOnInit(): void {
    if (this.role === RoleTypes.WAITER){
      this.updateServingTablesList(); //it also updates orders
      this.socketService.listenToServer(Events.UPDATE_TABLES_LIST).subscribe(() => this.updateServingTablesList());
    }
    else {
      this.updateOrdersList()
      this.socketService.listenToServer(Events.UPDATE_ORDERS_LIST).subscribe(() => this.updateOrdersList());
    }
  }

  updateServingTablesList(){
    if(this.usersService.role !== RoleTypes.WAITER) return;
    this.tablesService.getServingTables().subscribe(tables => {
      this.myTables = tables;
      this.ordersService.getOrders().subscribe(orders => {
        this.myOrders = orders;
        this.dispatchTables();
      })
    })
  }

  updateOrdersList(){
    this.ordersService.getOrders().subscribe(orders => {
      this.myOrders = orders;
      this.dispatchOrders();
    })
  }

  dispatchTables(): void{
    this.tablesWithOrders = [];
    this.tablesWithoutOrders = [...this.myTables];
    this.show_selected_tables = '';

    this.myOrders.forEach(order => {
      this.tablesService.getTable(order.table._id).subscribe(main_table => {
        let index = this.tablesWithOrders.findIndex(table_list => (table_list.findIndex(table => table.number === main_table.number)) >= 0);
        if (!(index >= 0))
          this.tablesWithOrders.push([main_table].concat(main_table.linked_tables));
        index = this.tablesWithoutOrders.findIndex(table => table.number === main_table.number);
        if (index >= 0){
          this.tablesWithoutOrders.splice(index,1);
          main_table.linked_tables.forEach(table => {
            index = this.tablesWithoutOrders.findIndex(table_to_delete => table_to_delete.number === table.number);
            if (index >= 0)
              this.tablesWithoutOrders.splice(index,1);
          });
        }
      })
    });
  }

  dispatchOrders(): void {
    this.receivedOrders = [];
    this.preparingOrders = [];
    this.terminatedOrders = [];

    this.myOrders.forEach((order) => {
      if (order.status === OrderStatus.RECEIVED)
        this.receivedOrders.push(order);
      else if (order.status === OrderStatus.PREPARING)
        this.preparingOrders.push(order);
      else if (order.status === OrderStatus.TERMINATED)   
        this.terminatedOrders.push(order);
    });

    this.groupOrders();
  }

  groupOrders(){
    let filteredGroups = [];
    this.receivedGroups = [];
    this.preparingGroups = [];
    this.terminatedGroups = [];

    this.receivedOrders.forEach( order => 
      this.tablesService.getTable(order.table._id).subscribe(main_table => {
        filteredGroups = this.receivedGroups.filter(group => group.table_numbers.includes(order.table.number));
        if (filteredGroups.length > 0){
          let index = this.receivedGroups.findIndex(group => group.table_numbers.includes(order.table.number));
          this.receivedGroups.at(index)?.orders.push(order);
        }
        else 
          this.receivedGroups.push({
            orders: [order],
            table_numbers: [...[main_table.number].concat(main_table.linked_tables.map((table => table.number)))],
            main_table: order.table
          })
      })
    );

    this.preparingOrders.forEach( order => 
      this.tablesService.getTable(order.table._id).subscribe(main_table => {
        filteredGroups = this.preparingGroups.filter(group => group.table_numbers.includes(order.table.number));
        if (filteredGroups.length > 0){
          let index = this.preparingGroups.findIndex(group => group.table_numbers.includes(order.table.number));
          this.preparingGroups.at(index)?.orders.push(order);
        }
        else 
          this.preparingGroups.push({
            orders: [order],
            table_numbers: [...[main_table.number].concat(main_table.linked_tables.map((table => table.number)))],
            main_table: order.table
          })
      })
    );

    this.terminatedOrders.forEach( order => 
      this.tablesService.getTable(order.table._id).subscribe(main_table => {
        filteredGroups = this.terminatedGroups.filter(group => group.table_numbers.includes(order.table.number));
        if (filteredGroups.length > 0){
          let index = this.terminatedGroups.findIndex(group => group.table_numbers.includes(order.table.number));
          this.terminatedGroups.at(index)?.orders.push(order);
        }
        else 
          this.terminatedGroups.push({
            orders: [order],
            table_numbers: [...[main_table.number].concat(main_table.linked_tables.map((table => table.number)))],
            main_table: order.table
          })
      })
    );
  }

  selectTable(selected_table: Table): void {
    let index = this.tablesWithoutOrders.findIndex(table => table.number === selected_table.number);
    if (index >= 0){
      index = this.selectedTables.findIndex(table => table.number === selected_table.number);
      if (index >= 0)
        this.selectedTables.splice(index,1);
      else
        this.selectedTables.push(selected_table);

      if(this.selectedTables.length === 0)
        this.dispatchTables();
      else if (this.selectedTables.length === 1)
        this.tablesWithOrders = [];
    }
    else {
      if (this.selectedTables.length === 0){
        this.selectedTables = [selected_table];
        this.tablesWithoutOrders = [];
        this.tablesWithOrders = [[selected_table].concat(selected_table.linked_tables)];
      }
      else {
        this.selectedTables = [];
        this.dispatchTables();
      }
    }
    
    this.show_selected_tables = '';
    this.selectedTables.forEach(table => {
      this.show_selected_tables+=' '+table.number
      table.linked_tables.forEach(linked_table => { this.show_selected_tables+=' '+linked_table.number });
    });
  }

  createOrder(): void{
    if (this.selectedTables.length === 1)
      this.addNewOrder(this.selectedTables[0]);
    else 
      this.tablesService.linkTables(this.selectedTables).subscribe(main_table =>{
          this.addNewOrder(main_table);
      })
  }

  updateOrder(order: Order): void{
    this.ordersService.updateOrder(order).subscribe({ });
  }

  deleteOrder(order_id: string){
    this.ordersService.deleteOrder(order_id).subscribe();
  }

  addNewOrder(value: Table) {
    this.newOrderEvent.emit(value);
  }

  openDialog(receipt: Receipt) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;

    dialogConfig.data = {
      receipt: receipt
    };

    const dialogRef = this.dialog.open(ReceiptDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(
      data => { if(data) this.updateOrder(data); }
    ); 
  }

  getReceipt(table: Table){
    let unfinished = this.preparingGroups.some(group => group.main_table._id === table._id);
    unfinished = unfinished || this.receivedGroups.some(group => group.main_table._id === table._id);
    if (!unfinished)
      this.ordersService.getReceipt(table).subscribe((receipt)=>this.openDialog(receipt));
    else 
      this.openSnackBar('Cannot pay an order which is not terminated','CLOSE');
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action,{
      verticalPosition:'top'
    });
  }
}
