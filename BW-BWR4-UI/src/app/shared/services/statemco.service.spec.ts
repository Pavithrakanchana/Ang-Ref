import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { StatemcoService } from './statemco.service';

describe('StatemcoService', () => {
  let service: StatemcoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        StatemcoService
      ]
    });
    service = TestBed.inject(StatemcoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
