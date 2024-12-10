import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayplansComponent } from './payplans.component';

describe('PayplansComponent', () => {
  let component: PayplansComponent;
  let fixture: ComponentFixture<PayplansComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PayplansComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PayplansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
