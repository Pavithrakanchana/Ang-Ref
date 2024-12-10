import { TestBed } from '@angular/core/testing';
import { SharedUnittestModule } from '../modules/shared/shared-unittest.module';

import { VinprefillService } from './vinprefill.service';

describe('VinprefillService', () => {
  let service: VinprefillService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedUnittestModule]
    });
    service = TestBed.inject(VinprefillService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
