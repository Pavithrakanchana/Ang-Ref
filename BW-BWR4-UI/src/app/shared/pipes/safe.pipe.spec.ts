import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { SafePipe } from './safe.pipe';



describe('SafePipe', () => {
  let domSanitizer: DomSanitizer;
  beforeEach( () => {
  TestBed.configureTestingModule({

    providers: [DomSanitizer]
  });

  domSanitizer = TestBed.get(DomSanitizer);
  });


  it('create an instance', () => {
    const pipe = new SafePipe(domSanitizer);
    expect(pipe).toBeTruthy();
  });
});
