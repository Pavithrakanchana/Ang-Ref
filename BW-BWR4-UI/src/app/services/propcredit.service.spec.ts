import { TestBed } from '@angular/core/testing';
import { SharedUnittestModule } from '../modules/shared/shared-unittest.module';

import { PropCreditService } from './propcredit.service';

describe('PropCreditService', () => {
  let service: PropCreditService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedUnittestModule]
    });
    service = TestBed.inject(PropCreditService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
