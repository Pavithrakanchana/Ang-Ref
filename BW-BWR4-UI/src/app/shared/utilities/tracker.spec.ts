import { TestBed } from '@angular/core/testing';
import { SharedUnittestModule } from 'src/app/modules/shared/shared-unittest.module';
import { LoggerService } from '../services/logger.service';
import { Tracker } from './tracker';

describe('Tracker', () => {
  let logService: LoggerService;
  beforeEach( () => {
  TestBed.configureTestingModule({
    imports: [SharedUnittestModule],
    providers: [LoggerService]
  });

  logService = TestBed.get(LoggerService);
  });
  it('should create an instance', () => {
    expect(new Tracker(logService)).toBeTruthy();
  });
});
