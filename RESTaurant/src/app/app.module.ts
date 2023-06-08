import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from '@angular/common';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { MatDialogModule } from "@angular/material/dialog";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from "@angular/material/button";

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login-component/login.component';
import { HomeComponent } from './components/home-component/home.component';
import { CreateUserComponent } from './components/create-user-component/create-user.component';
import { TablesComponent } from './components/tables-component/tables.component';
import { OrdersComponent } from './components/orders-component/orders.component';
import { FoodsComponent } from './components/foods-component/foods.component';
import { TableOccupancyDialogComponent } from './components/table-occupancy-dialog/table-occupancy-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    CreateUserComponent,
    TablesComponent,
    OrdersComponent,
    FoodsComponent,
    TableOccupancyDialogComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
