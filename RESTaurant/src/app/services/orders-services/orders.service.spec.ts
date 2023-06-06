import { TestBed } from '@angular/core/testing';

import { OrdersService } from './orders.service';

describe('OrdersServiceService', () => {
  let service: OrdersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrdersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
