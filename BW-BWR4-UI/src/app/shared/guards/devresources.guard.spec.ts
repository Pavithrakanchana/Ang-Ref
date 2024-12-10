import { TestBed } from '@angular/core/testing';
import { SharedUnittestModule } from 'src/app/modules/shared/shared-unittest.module';

import { DevresourcesGuard } from './devresources.guard';

describe('DevresourcesGuard', () => {
  let guard: DevresourcesGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedUnittestModule]
    });
    guard = TestBed.inject(DevresourcesGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
