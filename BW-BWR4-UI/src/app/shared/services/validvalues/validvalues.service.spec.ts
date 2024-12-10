import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ValidValuesService } from './validvalues.service';

describe('DropdownService', () => {
  let service: ValidValuesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        HttpClientTestingModule,
        ValidValuesService
      ]
    });
    service = TestBed.inject(ValidValuesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
