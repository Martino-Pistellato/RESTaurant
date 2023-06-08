import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableOccupancyDialogComponent } from './table-occupancy-dialog.component';

describe('TableOccupancyDialogComponent', () => {
  let component: TableOccupancyDialogComponent;
  let fixture: ComponentFixture<TableOccupancyDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TableOccupancyDialogComponent]
    });
    fixture = TestBed.createComponent(TableOccupancyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
