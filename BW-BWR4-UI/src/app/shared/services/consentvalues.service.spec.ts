import { TestBed } from '@angular/core/testing';

import { ConsentvaluesService } from './consentvalues.service';

describe('ConsentvaluesService', () => {
  let service: ConsentvaluesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConsentvaluesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
