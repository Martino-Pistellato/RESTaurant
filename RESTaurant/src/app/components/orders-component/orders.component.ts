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
  private selectedTables: Table[] = [];
  private myOrders: Order[] = [];
  public tablesWithOrders: Table[] = [];
  public tablesWithoutOrders: Table[] = [];

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

    this.myOrders.forEach((order) => {
      this.tablesWithOrders.push(...order.tables);
    });

    this.tablesWithoutOrders = this.myTables.slice();
  
    this.myTables.forEach((table) => {
      this.tablesWithOrders.forEach((table_with_order) => {
        if(table_with_order._id === table._id) {
          console.log("index to eliminate: "+this.tablesWithoutOrders.indexOf(table))
          console.log("table to eliminate: ", this.tablesWithoutOrders.at(this.tablesWithoutOrders.indexOf(table)))
          this.tablesWithoutOrders.splice(this.tablesWithoutOrders.indexOf(table),1);}
        }
      );
    });

    console.log("table with order: ", ...this.tablesWithOrders)
    console.log("table without order: ", ...this.tablesWithoutOrders)

  }

  selectTable(table: Table): void {
    if (this.selectedTables.includes(table)) {
      this.selectedTables.splice(this.selectedTables.indexOf(table), 1);
    }
    else
      this.selectedTables.push(table);

    this.dispatchTables();

    if (this.selectedTables.length === 0) return;

    if (this.selectedTables.every((table) => { 
      let found = false;
      this.tablesWithoutOrders.forEach((table_without_order) => { if(table_without_order._id === table._id) found = true;}) 
      return found;    
    })){
      this.tablesWithOrders = [];
      //the waiter has chosen a table not assigned to any order, so we show only other free tables
    }
    else{
      let order: Order|undefined = undefined;

      this.tablesWithoutOrders = [];
      this.myOrders.forEach((my_order) => {if (my_order.tables.includes(table)) order = my_order;})
      if (order !== undefined) //can it actually be undefined? if so, what happens?
        this.tablesWithOrders = (order as Order).tables; //we only show tables related to the same order
    }
  }

  getOrderId(): void {
    let orderId : string = '';

    this.myOrders.forEach((order) => {
      if (this.selectedTables.every((table) => { order.tables.includes(table) })){
        orderId = order._id;
        this.selectedTables = order.tables;
      }
    });

    //we should check if this.selectedTables contains tables from different orders, in that case it should fail
    //shouldn't happen thanks to the function above

    if (orderId === '') {
      this.ordersService.createOrder([...this.selectedTables.map((table) => { return ''+table._id })]).subscribe( (order) => {
          this.dispatchTables();
          this.selectedTables = [];
          this.router.navigate(['home']);
        }
      );
    }
    else{
      this.selectedTables = [];
      this.dispatchTables();
      this.router.navigate(['home']);
    } //we should send somehow the orderId


    //alfredo@waiter.RESTaurant.it
  }


}
