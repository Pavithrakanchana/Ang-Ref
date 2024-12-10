import { TestBed } from '@angular/core/testing';
import { SharedUnittestModule } from '../modules/shared/shared-unittest.module';

import { VehicleHistoryService } from './vehicle-history.service';

describe('VehicleHistoryService', () => {
  let service: VehicleHistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedUnittestModule]
    });
    service = TestBed.inject(VehicleHistoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
