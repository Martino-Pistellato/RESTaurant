import { Component, Input } from '@angular/core';
import * as chart from 'chart.js/auto'

import { UsersService, User, RoleTypes } from 'src/app/services/users-services/users.service';
import { Table, TablesService } from 'src/app/services/tables-services/tables.service';
import { Food, FoodsService, FoodTypes } from 'src/app/services/foods-services/foods.service';
import { OrdersService, Order } from 'src/app/services/orders-services/orders.service';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent {

  protected users: User[] = [];
  protected tables: Table[] = [];
  protected foods: Food[] = [];
  protected orders: Order[] = [];
  @Input() total_profit: number = 0;

  constructor(private usersService: UsersService, 
              private tablesService: TablesService,
              private foodsService: FoodsService,
              private ordersService: OrdersService){}
  
  //Gets all data present on the database
  ngOnInit(){
    this.usersService.getUsers().subscribe(users => {
      this.users = users;
      this.tablesService.getTables().subscribe(tables => {
        this.tables = tables;
        this.foodsService.getFoods().subscribe(foods => {
          this.foods = foods;
          this.ordersService.getAllOrders().subscribe(orders => {
            this.orders = orders.filter(order => order.is_payed);
            this.drawCharts();
          })
          
        });
      });
    });
  }

  //Draws the stats charts
  drawCharts(){
    //A chart that shows stats regarding waiters (n. of tables currently served/n. of clients currently served)
    new chart.Chart((document.getElementById('waiters') as chart.ChartItem),{
      type: 'bar',
      data: {
        labels: this.users.filter(user => user.role === RoleTypes.WAITER).map(user => user.name),
        datasets: [
          {
            label: 'Currently served tables',
            data: this.users.filter(user => user.role === RoleTypes.WAITER).map(user => ({
              y: this.tables.filter(table=>{ 
                if (table.waiter_id === null || (typeof table.waiter_id === 'string')) return false;
                else return (table.waiter_id as User)._id === user._id;
              }).length,
              x: user.name
            }))
          },
          {
            label: 'Currently served clients',
            data: this.users.filter(user => user.role === RoleTypes.WAITER).map(user => ({
              y: this.tables.filter(table => { 
                  if (table.waiter_id === null || (typeof table.waiter_id === 'string')) return false;
                  else return (table.waiter_id as User)._id === user._id;
                }).map(table => table.occupancy).reduce((partialSum, a) => partialSum + a, 0),
              x: user.name
            }))
          }
        ]
      }
    });

    //A chart showing stats regarding cashiers (how much money they registered in today's total profit)
    new chart.Chart((document.getElementById('cashiers') as chart.ChartItem),{
      type: 'bar',
      data: {
        labels: this.users.filter(user => user.role === RoleTypes.CASHIER).map(user => user.name),
        datasets: [
          {
            label: 'Profit earned',
            data: this.users.filter(user => user.role === RoleTypes.CASHIER).map(user => ({
              y: this.orders.filter(order => user.totalWorks.includes(order._id)).map(order => {
                let total = 0;
                order.foods.forEach(food => total += food.price);
                total += 2*order.covers;
                return total;
              }).reduce((partialSum, a) => partialSum + a, 0),
              x: user.name
            }))
          }
        ]
      }
    });

    //A chart showing stats regarding cooks (which food and how many portions of it a cook prepared)
    new chart.Chart((document.getElementById('cooks') as chart.ChartItem),{
      type: 'bar',
      data: {
        labels: this.foods.filter(food => food.type !== FoodTypes.DRINK).map(food => food.name), 
        datasets: [
          ...this.users.filter(user => user.role === RoleTypes.COOK).map(user => { return {
              label: 'Foods prepared by '+ user.name,
              data: this.foods.filter(food => food.type !== FoodTypes.DRINK).map(food => ({
                y: user.totalWorks.filter(work => work === food._id).length,
                x: food.name
              }))
          }})
        ]
      } 
    });

    //A chart showing stats regarding barmen (which drink and how many of it a barman prepared)
    new chart.Chart((document.getElementById('barmen') as chart.ChartItem),{
      type: 'bar',
      data: {
        labels: this.foods.filter(food => food.type === FoodTypes.DRINK).map(food => food.name), 
        datasets: [
          ...this.users.filter(user => user.role === RoleTypes.BARMAN).map(user => { return {
              label: 'Drinks prepared by '+ user.name,
              data: this.foods.filter(food => food.type === FoodTypes.DRINK).map(food => ({
                y: user.totalWorks.filter(work => work === food._id).length,
                x: food.name
              }))
          }})
        ]
      } 
    });
  }
}
