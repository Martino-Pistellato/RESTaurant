import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TablesService, Table } from 'src/app/services/tables-services/tables.service';
import { OrdersService, Order } from 'src/app/services/orders-services/orders.service';
import { UsersService, RoleTypes } from 'src/app/services/users-services/users.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent {
  private myTables: Table[] = [];
  private myOrders: Order[] = [];
  private tablesWithOrders: Table[] = [];

  public tablesWithoutOrders: Table[] = [];
  public selectedTables: Table[] = [];
  public shownSelectedTables: string = '';
  public shownOrders: Order[] = [];
  public role: RoleTypes;

  constructor(private tablesService: TablesService, 
              private ordersService: OrdersService,
              private usersService: UsersService, 
              private router: Router) {
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
      }
    );
  }

  dispatchTables(): void{
    this.tablesWithOrders = [];
    this.tablesWithoutOrders = [];
    this.tablesWithoutOrders = this.myTables.slice();
    this.shownOrders = this.myOrders.slice();

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
      this.ordersService.createOrder([...this.selectedTables.map((table) => { return ''+table._id })])
      .subscribe((order) => { 
        this.ordersService.selectedOrder = order._id;
        this.changePage('foods'); 
      });
    else{ 
      this.ordersService.selectedOrder = (this.shownOrders.at(0) as Order)._id;
      this.changePage('foods');
    }
  }

  changePage(route: string): void{
    this.selectedTables = [];
    this.dispatchTables();
    this.router.navigate([route]);
  }
}
