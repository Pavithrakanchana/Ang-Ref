import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedUnittestModule } from 'src/app/modules/shared/shared-unittest.module';
import { SafePipe } from '../../pipes/safe.pipe';
import { PaymentsService } from '../../services/payments.service';
import { SpinnerStatusService } from '../../services/spinner-status.service';

import { SplPaymentMethodComponent } from './spl-payment-dialog.component';

describe('SplPaymentMethodComponent', () => {
  let component: SplPaymentMethodComponent;
  let fixture: ComponentFixture<SplPaymentMethodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedUnittestModule, SafePipe],
      declarations: [ SplPaymentMethodComponent ],
      providers: [
        PaymentsService,
        SpinnerStatusService,
        SafePipe
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SplPaymentMethodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
