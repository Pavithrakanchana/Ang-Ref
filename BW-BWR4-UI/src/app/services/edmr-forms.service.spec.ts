import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { EdmrFormsService } from './edmr-forms.service';

describe('EdmrFormsService', () => {
  let service: EdmrFormsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        EdmrFormsService
      ]
    });
    service = TestBed.inject(EdmrFormsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
