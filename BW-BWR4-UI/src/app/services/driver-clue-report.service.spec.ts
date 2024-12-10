import { TestBed } from '@angular/core/testing';
import { SharedUnittestModule } from '../modules/shared/shared-unittest.module';

import { DriverClueReportService } from './driver-clue-report.service';

describe('DriverClueReportService', () => {
  let service: DriverClueReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedUnittestModule]
    });
    service = TestBed.inject(DriverClueReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
