import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { SharedUnittestModule } from 'src/app/modules/shared/shared-unittest.module';

import { ReviewUploaddocPopupComponent } from './review-uploaddoc-popup.component';

describe('ReviewUploaddocPopupComponent', () => {
  let component: ReviewUploaddocPopupComponent;
  let fixture: ComponentFixture<ReviewUploaddocPopupComponent>;

  beforeEach(async () => {
    // const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
    await TestBed.configureTestingModule({
      imports: [SharedUnittestModule],
      declarations: [ ReviewUploaddocPopupComponent ],
      /*providers: [
        {provide: Router, useValue: routerSpy}
      ]*/
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewUploaddocPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
