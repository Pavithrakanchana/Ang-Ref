import { TestBed } from '@angular/core/testing';
import { SharedUnittestModule } from '../modules/shared/shared-unittest.module';

import { AddressVerificationService } from './address-verification.service';

describe('AddressVerificationService', () => {
  let service: AddressVerificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedUnittestModule]
    });
    service = TestBed.inject(AddressVerificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
