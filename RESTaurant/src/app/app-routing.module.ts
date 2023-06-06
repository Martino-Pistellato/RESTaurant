import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login-component/login.component';
import { OrdersComponent } from './components/orders-component/orders.component';
import { TablesComponent } from './components/tables-component/tables.component';
import { FoodsComponent } from './components/foods-component/foods.component';
import { HomeComponent } from './components/home-component/home.component';
import { CreateUserComponent } from './components/create-user-component/create-user.component';

const routes: Routes = [
  { path: 'home', component:  HomeComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component:  LoginComponent },
  { path: 'orders', component:  OrdersComponent },
  { path: 'tables', component:  TablesComponent },
  { path: 'foods', component:  FoodsComponent },
  { path: 'users', component:  CreateUserComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
