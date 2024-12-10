import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyFeesComponent } from './policy-fees.component';

describe('PolicyFeesComponent', () => {
  let component: PolicyFeesComponent;
  let fixture: ComponentFixture<PolicyFeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PolicyFeesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyFeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
