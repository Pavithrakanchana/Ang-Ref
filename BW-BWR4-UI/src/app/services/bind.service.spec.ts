import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { reducers, metaReducers } from '../state/appstate.state';

import { BindService } from './bind.service';

describe('BindService', () => {
  let service: BindService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        StoreModule.forRoot(reducers, { metaReducers })
      ],
      providers: [
        HttpClientTestingModule,
        BindService
      ]
    });
    service = TestBed.inject(BindService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
