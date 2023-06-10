import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { ReceiptDialogComponent } from '../receipt-dialog/receipt-dialog.component';
import { TablesService, Table } from 'src/app/services/tables-services/tables.service';
import { OrdersService, Order, OrderStatus, Receipt } from 'src/app/services/orders-services/orders.service';
import { UsersService, RoleTypes } from 'src/app/services/users-services/users.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent {
  private myTables: Table[] = [];
  protected myOrders: Order[] = [];
  
  protected role: RoleTypes;

  //USED FOR WAITERS  
  private tablesWithOrders: Table[] = [];
  protected tablesWithoutOrders: Table[] = [];
  protected selectedTables: Table[] = [];
  protected shownSelectedTables: string = '';
  protected shownOrders: Order[] = [];

  //FOR COOKS AND BARMEN
  protected arrivedOrders: Order[] = [];
  protected preparingOrders: Order[] = [];

  //FOR CASHIER
  protected terminatedOrders: Order[] = [];

  constructor(private tablesService: TablesService, 
              private ordersService: OrdersService,
              private usersService: UsersService, 
              private router: Router,
              private dialog: MatDialog) {
    this.role = (this.usersService.role as RoleTypes);
  }

  ngOnInit(): void {
    this.ordersService.getOrders().subscribe(
      (orders) => { 
        this.myOrders = orders;

        if (this.role === RoleTypes.WAITER) 
          this.tablesService.getMyTables().subscribe(
            (tables) => { 
              this.myTables = tables; 
              this.dispatchTables(); 
            }
          );
        else this.dispatchOrders();       
      }
    );
  }

  dispatchTables(): void{
    this.tablesWithOrders = [];
    this.tablesWithoutOrders = [...this.myTables];
    this.shownOrders = [...this.myOrders];

    this.myOrders.forEach((order) => {
      this.tablesWithOrders.push(...order.tables);
    });

    this.myTables.forEach((table) => {
      this.tablesWithOrders.every((table_with_order) => { //every it's just more efficient than forEach
        if(table_with_order._id === table._id) 
          return this.tablesWithoutOrders.splice(this.tablesWithoutOrders.indexOf(table),1) === null;
        return true;
      });
    });
  }

  dispatchOrders(): void {
    this.preparingOrders = [];
    this.arrivedOrders = [];
    this.terminatedOrders = [];

    this.ordersService.getOrders().subscribe(
      (orders) => { 
        this.myOrders = orders;

        if (this.role === RoleTypes.BARMAN)
          this.myOrders.forEach((order)=>{
            if(order.status.beverages === OrderStatus.PREPARING)
              this.preparingOrders.push(order);
            else if(order.status.beverages === OrderStatus.RECEIVED)
              this.arrivedOrders.push(order);
          });
        else if (this.role === RoleTypes.COOK)
          this.myOrders.forEach((order)=>{
            if(order.status.foods === OrderStatus.PREPARING)
              this.preparingOrders.push(order);
            else if(order.status.foods === OrderStatus.RECEIVED)
              this.arrivedOrders.push(order);
          });
        else {
          this.myOrders.forEach((order)=>{
            if(order.status.foods === OrderStatus.RECEIVED || order.status.beverages === OrderStatus.RECEIVED)
              this.arrivedOrders.push(order);
            else if(order.status.foods === OrderStatus.PREPARING || order.status.beverages === OrderStatus.PREPARING)
              this.preparingOrders.push(order);
            else if (!order.payed)
              this.terminatedOrders.push(order);
          });
        }
      }
    );
  }

  selectTable(table: Table, order: Order | null): void {
    if (this.selectedTables.includes(table)) 
      this.selectedTables.splice(this.selectedTables.indexOf(table), 1);
    else
      this.selectedTables.push(table);

    this.shownSelectedTables = '';
    this.selectedTables.forEach((table)=>{ this.shownSelectedTables+=table.number+' '; });

    if (this.selectedTables.length === 0){ //there aren't selected tables so we have to reset what is shown
      this.dispatchTables();
      return;
    }
    else if (this.selectedTables.length === 1){ //the first element is selected and we change what is selectable
      if (order !== null){
        this.tablesWithoutOrders = [];
        this.shownOrders = [order];
      }
      else
        this.shownOrders = [];
    }
    else return; //we don't have to change what is shown
  }

  getOrderId(): void { //alfredo@waiter.RESTaurant.it
    if (this.selectedTables.length === 0) return;

    if (this.shownOrders.length === 0)
      this.ordersService.createOrder(this.selectedTables)
      .subscribe((order) => { 
        this.ordersService.selectedOrder = order._id;
        this.changePage('foods'); 
      });
    else{ 
      this.ordersService.selectedOrder = (this.shownOrders.at(0) as Order)._id;
      this.changePage('foods');
    }
  }

  updateOrder(order: Order): void{
    this.ordersService.updateOrder(order).subscribe((updated_order: Order) => this.dispatchOrders());
  }

  changePage(route: string): void {
    this.selectedTables = [];
    this.dispatchTables();
    this.router.navigate([route]);
  }

  openDialog(receipt: Receipt) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    dialogConfig.data = {
        receipt: receipt
    };

    const dialogRef = this.dialog.open(ReceiptDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(
        data => this.dispatchOrders()
    ); 
  }

  pay(order: Order): void{
    this.ordersService.pay(order).subscribe((receipt)=>{ 
      order.tables.forEach(table => this.tablesService.changeStatus(table.number,0));
      this.openDialog(receipt) 
    });
  }
}
