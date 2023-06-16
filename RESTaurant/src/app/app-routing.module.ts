import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login-component/login.component';
import { OrdersComponent } from './components/orders-component/orders.component';
import { TablesComponent } from './components/tables-component/tables.component';
import { FoodsComponent } from './components/foods-component/foods.component';
import { HomeComponent } from './components/home-component/home.component';
import { StatsComponent } from './components/stats-component/stats.component';
import { UsersComponent } from './components/users-component/users.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component:  HomeComponent },
  { path: 'login', component:  LoginComponent },
  { path: '**', redirectTo: 'home', pathMatch: 'full' },
  // { path: 'home/orders', component:  OrdersComponent },
  // { path: 'home/tables', component:  TablesComponent },
  // { path: 'home/foods', component:  FoodsComponent },
  // { path: 'home/stats', component:  StatsComponent },
  // { path: 'home/users', component:  UsersComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
