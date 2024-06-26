import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablesComponent } from './tables.component';

describe('TableComponent', () => {
  let component: TablesComponent;
  let fixture: ComponentFixture<TablesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TablesComponent]
    });
    fixture = TestBed.createComponent(TablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
