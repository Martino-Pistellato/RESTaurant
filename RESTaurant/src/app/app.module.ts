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
import { MatCardModule } from "@angular/material/card";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatDividerModule } from "@angular/material/divider"
import { MatIconModule } from "@angular/material/icon"
import {MatSidenavModule} from '@angular/material/sidenav';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login-component/login.component';
import { HomeComponent } from './components/home-component/home.component';
import { TablesComponent } from './components/tables-component/tables.component';
import { OrdersComponent } from './components/orders-component/orders.component';
import { FoodsComponent } from './components/foods-component/foods.component';
import { TableOccupancyDialogComponent } from './components/table-occupancy-dialog-component/table-occupancy-dialog.component';
import { ReceiptDialogComponent } from './components/receipt-dialog-component/receipt-dialog.component';
import { StatsComponent } from './components/stats-component/stats.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    TablesComponent,
    OrdersComponent,
    FoodsComponent,
    TableOccupancyDialogComponent,
    ReceiptDialogComponent,
    StatsComponent
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
    MatButtonModule,
    MatExpansionModule,
    MatCardModule,
    MatToolbarModule,
    MatDividerModule,
    MatIconModule, 
    MatSidenavModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
