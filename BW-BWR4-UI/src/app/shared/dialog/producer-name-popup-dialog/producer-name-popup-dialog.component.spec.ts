import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedUnittestModule } from 'src/app/modules/shared/shared-unittest.module';

import { ProducerNamePopupDialogComponent } from './producer-name-popup-dialog.component';

describe('ProducerNamePopupDialogComponent', () => {
  let component: ProducerNamePopupDialogComponent;
  let fixture: ComponentFixture<ProducerNamePopupDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedUnittestModule],
      declarations: [ ProducerNamePopupDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProducerNamePopupDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
