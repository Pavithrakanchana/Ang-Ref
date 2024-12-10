import { TestBed } from '@angular/core/testing';
import { SharedUnittestModule } from '../modules/shared/shared-unittest.module';

import { VintelligenceSymbolsService } from './vintelligence-symbols.service';

describe('VintelligenceSymbolsService', () => {
  let service: VintelligenceSymbolsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedUnittestModule]
    });
    service = TestBed.inject(VintelligenceSymbolsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
