import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TablesService, Table } from 'src/app/services/tables-services/tables.service';
import { OrdersService, Order } from 'src/app/services/orders-services/orders.service';

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

  constructor(private tablesService: TablesService, private ordersService: OrdersService, private router: Router) { }

  ngOnInit(): void {
    this.tablesService.getMyTables().subscribe(
      (tables) => { 
        this.myTables = tables; 
        this.ordersService.getOrders().subscribe(
          (orders) => { 
            this.myOrders = orders;  
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
    if (this.shownOrders.length === 0)
      this.ordersService.createOrder([...this.selectedTables.map((table) => { return ''+table._id })])
      .subscribe((order) => { this.changePage('home'); });
    else //this.shownOrder.at(0) contains the order related to the selected tables
      this.changePage('home');//we should send somehow the orderId 
  }

  changePage(route: string): void{
    this.selectedTables = [];
    this.dispatchTables();
    this.router.navigate([route]);
  }
}
