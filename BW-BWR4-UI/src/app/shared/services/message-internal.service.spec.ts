import { TestBed } from '@angular/core/testing';

import { MessageInternalService } from './message-internal.service';

describe('MessageInternalService', () => {
  let service: MessageInternalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MessageInternalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
