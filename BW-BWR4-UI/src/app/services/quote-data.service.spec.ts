import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SharedUnittestModule } from '../modules/shared/shared-unittest.module';

import { QuoteDataService } from './quote-data.service';

describe('QuoteDataService', () => {
  let service: QuoteDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedUnittestModule, HttpClientTestingModule],
      providers: [
        HttpClientTestingModule,
        QuoteDataService
      ]
    });
    service = TestBed.inject(QuoteDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
