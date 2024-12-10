import { TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { SharedUnittestModule } from '../modules/shared/shared-unittest.module';
import { reducers, metaReducers } from '../state/appstate.state';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedUnittestModule
      ],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
