import { Component } from '@angular/core';
import { FoodsService, Food } from '../../services/foods-services/foods.service';

@Component({
  selector: 'app-foods',
  templateUrl: './foods.component.html',
  styleUrls: ['./foods.component.css']
})
export class FoodsComponent {
  public food: Food[] = [];

  constructor(private _foodService: FoodsService) { }

  ngOnInit(): void {
    this.getFoods();
  }

  getFoods(): void{
    this._foodService.getFoods().subscribe((foods: Food[]) => this.food = foods);
  }
}
