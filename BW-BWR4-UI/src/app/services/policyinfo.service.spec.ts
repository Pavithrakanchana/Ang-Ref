import { TestBed } from '@angular/core/testing';
import { SharedUnittestModule } from '../modules/shared/shared-unittest.module';

import { PolicyinfoService } from './policyinfo.service';

describe('PolicyinfoService', () => {
  let service: PolicyinfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedUnittestModule]
    });
    service = TestBed.inject(PolicyinfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
