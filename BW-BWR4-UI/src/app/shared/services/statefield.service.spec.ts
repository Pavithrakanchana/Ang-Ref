import { TestBed } from '@angular/core/testing';

import { StatefieldService } from './statefield.service';

describe('StatefieldService', () => {
  let service: StatefieldService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StatefieldService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
